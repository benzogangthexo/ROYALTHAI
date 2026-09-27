"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle, Phone, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingConfig as config } from "@/content/booking";
import { useMounted } from "@/hooks/use-mounted";
import { useResource } from "@/hooks/use-resource";
import { ApiError, apiFetch } from "@/lib/api/client";
import {
  BookingResponseSchema,
  ContactSchema,
  HoldResponseSchema,
  SlotsResponseSchema,
  type BookingResponse,
  type SlotsResponse,
} from "@/lib/api/schemas";
import { bookingDays, buildSlots, formatDateLong, type BookingStep } from "@/lib/booking";
import { cn, telHref } from "@/lib/utils";

import { BOOKING_EVENT, type BookingPreset } from "./preset";

type Flow = { kind: "choice"; step: BookingStep } | { kind: "date" | "time" | "contact"; title: string };

const FLOW: Flow[] = [
  ...config.steps.map((step) => ({ kind: "choice" as const, step })),
  { kind: "date", title: "День" },
  { kind: "time", title: "Время" },
  { kind: "contact", title: "Контакты" },
];

const flowId = (f: Flow) => (f.kind === "choice" ? f.step.id : f.kind);
const flowTitle = (f: Flow) => (f.kind === "choice" ? f.step.title : f.title);

const formatPhone = (digits: string) => {
  const d = digits.padEnd(10, "_");
  if (!digits) return "";
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`.replace(/[-\s)(]*_[\s\S]*$/, "");
};

const toDigits = (value: string) => {
  let d = value.replace(/\D/g, "");
  if (d.length > 10 && (d.startsWith("7") || d.startsWith("8"))) d = d.slice(1);
  return d.slice(0, 10);
};

const newRequestId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Запись по шагам: выборы из конфига -> день -> время -> контакты -> успех.
 * Слоты: скелетон по геометрии, empty, error + retry. Время: оптимистичный выбор с откатом по 409.
 * Заявка: идемпотентный requestId + ретраи. Предвыбор снаружи: presetBooking(stepId, optionId).
 */
export function BookingWizard({ className, successNote }: { className?: string; successNote?: ReactNode }) {
  const uid = useId();
  const mounted = useMounted();
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [groupFilter, setGroupFilter] = useState<Record<string, string>>({});
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);
  const [takenNote, setTakenNote] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [interacted, setInteracted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const choicesRef = useRef(choices);

  const scope = config.scopeStep ? choices[config.scopeStep] : undefined;
  const current = FLOW[index];
  const currentId = flowId(current);

  const slotsKey = date ? `${date}|${scope ?? ""}` : null;
  const slots = useResource<SlotsResponse>(
    slotsKey,
    (signal) =>
      apiFetch(`/api/slots?date=${date}${scope ? `&scope=${encodeURIComponent(scope)}` : ""}`, {
        schema: SlotsResponseSchema,
        signal,
      }),
    { isEmpty: (d) => d.closed || !d.slots.some((s) => s.available) },
  );

  useEffect(() => {
    choicesRef.current = choices;
  }, [choices]);

  useEffect(() => {
    if (interacted) heading.current?.focus({ preventScroll: true });
  }, [index, result, interacted]);

  useEffect(() => {
    const onPreset = (e: Event) => {
      const { stepId, optionId } = (e as CustomEvent<BookingPreset>).detail;
      const at = FLOW.findIndex((f) => flowId(f) === stepId);
      if (at < 0) return;
      const next = { ...choicesRef.current, [stepId]: optionId };
      const firstOpen = FLOW.findIndex((f) => f.kind === "choice" && !next[f.step.id]);
      setInteracted(true);
      setResult(null);
      setChoices(next);
      setIndex(firstOpen >= 0 ? firstOpen : config.steps.length);
      if (stepId === config.scopeStep) {
        setDate(null);
        setTime(null);
        setHoldId(null);
      }
    };
    window.addEventListener(BOOKING_EVENT, onPreset);
    return () => window.removeEventListener(BOOKING_EVENT, onPreset);
  }, []);

  const go = (to: number) => {
    setInteracted(true);
    setIndex(Math.max(0, Math.min(FLOW.length - 1, to)));
  };

  const choose = (step: BookingStep, optionId: string, advance: boolean) => {
    setChoices((prev) => ({ ...prev, [step.id]: optionId }));
    if (step.id === config.scopeStep && choices[step.id] !== optionId) {
      setDate(null);
      setTime(null);
      setHoldId(null);
    }
    if (advance) window.setTimeout(() => go(index + 1), 220);
  };

  const pickDate = (d: string, advance: boolean) => {
    if (d !== date) {
      setTime(null);
      setHoldId(null);
      setTakenNote(null);
    }
    setDate(d);
    if (advance) window.setTimeout(() => go(index + 1), 220);
  };

  const pickTime = async (t: string) => {
    if (!date || holding) return;
    const prev = { time, holdId };
    setTime(t);
    setHoldId(null);
    setTakenNote(null);
    setHolding(true);
    try {
      const res = await apiFetch("/api/slots/hold", {
        method: "POST",
        body: { date, time: t, scope },
        schema: HoldResponseSchema,
        retries: 1,
      });
      setHoldId(res.holdId);
      go(index + 1);
    } catch (error) {
      setTime(prev.time);
      setHoldId(prev.holdId);
      if (error instanceof ApiError && error.status === 409) {
        slots.mutate((d) =>
          d
            ? { ...d, slots: d.slots.map((s) => (s.time === t ? { ...s, available: false } : s)) }
            : { date, timeZone: config.timeZone, closed: false, slots: [] },
        );
        setTakenNote(`${t} только что заняли. Выберите другое время`);
      } else {
        toast.error(error instanceof ApiError ? error.message : "Не получилось, попробуйте ещё раз");
      }
    } finally {
      setHolding(false);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date || !time) return;
    const parsed = ContactSchema.safeParse({
      name,
      phone: phone.length ? `+7${phone}` : "",
      comment: comment.trim() ? comment : undefined,
      consent,
    });
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error).fieldErrors;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(flat)) if (Array.isArray(v) && v[0]) next[k] = String(v[0]);
      setErrors(next);
      const first = ["name", "phone", "comment", "consent"].find((k) => next[k]);
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    const rid = requestId ?? newRequestId();
    setRequestId(rid);
    try {
      const res = await apiFetch("/api/booking", {
        method: "POST",
        schema: BookingResponseSchema,
        body: { ...parsed.data, requestId: rid, holdId: holdId ?? undefined, scope, choices, date, time },
        retries: 2,
      });
      setInteracted(true);
      setResult(res);
      setRequestId(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.fields) {
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(error.fields)) if (v[0]) next[k] = v[0];
        setErrors(next);
      } else if (error instanceof ApiError && error.status === 409) {
        setTakenNote(error.message);
        setTime(null);
        setHoldId(null);
        setRequestId(null);
        slots.retry();
        go(FLOW.findIndex((f) => f.kind === "time"));
      } else {
        setSubmitError(error instanceof ApiError ? error.message : "Заявка не отправилась, попробуйте ещё раз");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setInteracted(true);
    setResult(null);
    setIndex(0);
    setChoices({});
    setDate(null);
    setTime(null);
    setHoldId(null);
    setComment("");
    setTakenNote(null);
  };

  const summary = FLOW.slice(0, index)
    .map((f, i) => {
      const id = flowId(f);
      let value: string | undefined;
      if (f.kind === "choice") value = f.step.options.find((o) => o.id === choices[id])?.label;
      if (f.kind === "date" && date) value = formatDateLong(date);
      if (f.kind === "time" && time) value = time;
      return value ? { i, label: flowTitle(f), value } : null;
    })
    .filter((x): x is { i: number; label: string; value: string } => x !== null);

  if (result) {
    return (
      <div className={cn("booking rounded-[var(--radius-xl)] border border-line bg-surface p-5 sm:p-8", className)}>
        <div className="flex items-center gap-3 text-ok">
          <span className="grid size-10 place-items-center rounded-full bg-[color-mix(in_oklab,var(--ok)_18%,transparent)]">
            <Check aria-hidden="true" className="size-5" />
          </span>
          <span className="t-eyebrow">Заявка принята</span>
        </div>
        <h3 ref={heading} tabIndex={-1} className="t-h3 mt-5 outline-none">
          Ждём вас. Номер записи <span className="tabular text-brand">{result.code}</span>
        </h3>
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {result.summary.map((row) => (
            <div key={row.label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3">
              <dt className="text-fg-muted">{row.label}</dt>
              <dd className="text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-fg-muted">
          {successNote ?? "Администратор перезвонит, чтобы подтвердить запись. Если планы поменяются, просто позвоните."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href={telHref(config.phone)}>
              <Phone aria-hidden="true" />
              {config.phone}
            </a>
          </Button>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Новая запись
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("booking rounded-[var(--radius-xl)] border border-line bg-surface p-4 sm:p-8", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="t-eyebrow tabular text-fg-muted" aria-live="polite">
          Шаг {index + 1} из {FLOW.length}
        </p>
        {index > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => go(index - 1)} className="-mr-2">
            <ArrowLeft aria-hidden="true" />
            Назад
          </Button>
        ) : null}
      </div>
      <div className="mt-3 h-px w-full overflow-hidden bg-line" aria-hidden="true">
        <div
          className="h-full origin-left bg-brand transition-transform duration-700 ease-[var(--ease-out-expo)]"
          style={{ transform: `scaleX(${(index + 1) / FLOW.length})` }}
        />
      </div>

      {summary.length ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Уже выбрано">
          {summary.map((s) => (
            <li key={s.i}>
              <button
                type="button"
                onClick={() => go(s.i)}
                className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-line px-3 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                <span className="sr-only">Изменить: {s.label}.</span>
                {s.value}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <motion.div
        key={currentId}
        initial={interacted ? { opacity: 0, x: 18 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6"
      >
        <h3 ref={heading} tabIndex={-1} id={`${uid}-title`} className="t-h3 outline-none">
          {flowTitle(current)}
        </h3>

        {current.kind === "choice" ? (
          <ChoiceStep
            step={current.step}
            uid={uid}
            value={choices[current.step.id]}
            group={groupFilter[current.step.id]}
            onGroup={(g) => setGroupFilter((p) => ({ ...p, [current.step.id]: g }))}
            onChoose={(id, advance) => choose(current.step, id, advance)}
          />
        ) : null}

        {current.kind === "date" ? (
          <fieldset className="mt-5">
            <legend className="sr-only">Выберите день</legend>
            {mounted ? (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {bookingDays(config, scope).map((d) => (
                  <label
                    key={d.date}
                    className={cn(
                      "relative flex min-h-[4.75rem] cursor-pointer flex-col items-center justify-center rounded-[var(--radius)] border border-line px-1 py-2 text-center transition-colors",
                      "has-[:checked]:border-brand has-[:checked]:bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                      d.closed ? "cursor-not-allowed opacity-40" : "hover:border-line-strong",
                    )}
                    onClick={(e) => {
                      if (!d.closed && e.detail > 0) pickDate(d.date, true);
                    }}
                  >
                    <input
                      type="radio"
                      name={`${uid}-date`}
                      value={d.date}
                      className="sr-only"
                      disabled={d.closed}
                      checked={date === d.date}
                      onChange={() => pickDate(d.date, false)}
                    />
                    <span className="text-xs text-fg-muted">{d.rel}</span>
                    <span className="tabular text-xl leading-tight">{d.day}</span>
                    <span className="text-xs text-fg-muted">{d.closed ? "выходной" : d.month}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {Array.from({ length: config.daysAhead }, (_, i) => (
                  <Skeleton key={i} className="h-[4.75rem] rounded-[var(--radius)]" />
                ))}
              </div>
            )}
            <StepNext disabled={!date} onClick={() => go(index + 1)} />
          </fieldset>
        ) : null}

        {current.kind === "time" && date ? (
          <div className="mt-5">
            <p className="text-fg-muted">{formatDateLong(date)}</p>
            {takenNote ? (
              <p role="alert" className="mt-3 rounded-[var(--radius)] border border-danger/40 px-4 py-3 text-danger">
                {takenNote}
              </p>
            ) : null}
            <TimeGrid
              status={slots.status}
              data={slots.data}
              expected={buildSlots(config, date, scope).slots.length}
              selected={time}
              holding={holding}
              onPick={pickTime}
              onRetry={slots.retry}
              onBack={() => go(index - 1)}
              error={slots.error?.message}
            />
          </div>
        ) : null}

        {current.kind === "contact" ? (
          <form className="mt-5 grid gap-4" onSubmit={submit} noValidate>
            <Field id={`${uid}-name`} label="Имя" error={errors.name}>
              <input
                id={`${uid}-name`}
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                className="field"
              />
            </Field>
            <Field id={`${uid}-phone`} label="Телефон" error={errors.phone}>
              <input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 (___) ___-__-__"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(toDigits(e.target.value))}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
                className="field tabular"
              />
            </Field>
            <Field id={`${uid}-comment`} label="Комментарий (необязательно)" error={errors.comment}>
              <textarea
                id={`${uid}-comment`}
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errors.comment ? `${uid}-comment-err` : undefined}
                className="field min-h-24 resize-y py-3"
              />
            </Field>
            <div>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-fg-muted">
                <input
                  id={`${uid}-consent`}
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                  className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
                />
                <span>Согласен на обработку имени и телефона для записи</span>
              </label>
              {errors.consent ? (
                <p id={`${uid}-consent-err`} className="mt-1 text-sm text-danger">
                  {errors.consent}
                </p>
              ) : null}
            </div>
            {submitError ? (
              <p role="alert" className="rounded-[var(--radius)] border border-danger/40 px-4 py-3 text-danger">
                {submitError}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="w-full sm:w-auto">
              {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
              {submitting ? "Отправляем" : submitError ? "Отправить ещё раз" : "Записаться"}
            </Button>
            <p className="text-sm text-fg-muted">Время придержим на 10 минут, пока вы заполняете форму.</p>
          </form>
        ) : null}
      </motion.div>
    </div>
  );
}

function StepNext({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <div className="mt-5 flex justify-end">
      <Button type="button" variant="outline" disabled={disabled} onClick={onClick}>
        Дальше
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  );
}

function ChoiceStep({
  step,
  uid,
  value,
  group,
  onGroup,
  onChoose,
}: {
  step: BookingStep;
  uid: string;
  value: string | undefined;
  group: string | undefined;
  onGroup: (g: string) => void;
  onChoose: (id: string, advance: boolean) => void;
}) {
  const groups = step.groups ?? [];
  const selectedGroup = step.options.find((o) => o.id === value)?.group;
  const activeGroup = group ?? selectedGroup ?? groups[0]?.id;
  const options = groups.length ? step.options.filter((o) => o.group === activeGroup) : step.options;
  return (
    <fieldset className="mt-5">
      <legend className="sr-only">{step.title}</legend>
      {step.hint ? <p className="-mt-2 mb-4 text-fg-muted">{step.hint}</p> : null}
      {groups.length && activeGroup ? (
        <FilterChips
          label={`${step.title}: категории`}
          options={groups}
          value={activeGroup}
          onChange={onGroup}
          className="mb-4"
        />
      ) : null}
      <div
        className={cn(
          "grid gap-2 sm:grid-cols-2",
          step.columns === 1 && "sm:grid-cols-1",
          step.columns === 3 && "lg:grid-cols-3",
        )}
      >
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "relative flex min-h-16 cursor-pointer items-start justify-between gap-4 rounded-[var(--radius)] border border-line px-4 py-3 transition-colors hover:border-line-strong",
              "has-[:checked]:border-brand has-[:checked]:bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
            )}
            onClick={(e) => {
              if (e.detail > 0) onChoose(o.id, true);
            }}
          >
            <input
              type="radio"
              name={`${uid}-${step.id}`}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChoose(o.id, false)}
              className="sr-only"
            />
            <span className="min-w-0">
              <span className="block leading-snug">{o.label}</span>
              {o.note ? <span className="mt-0.5 block text-sm text-fg-muted">{o.note}</span> : null}
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              {o.price ? <span className="tabular text-sm text-brand">{o.price}</span> : null}
              {o.badge ? (
                <span className="rounded-[var(--radius-pill)] border border-line px-2 text-xs text-fg-muted">{o.badge}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      <StepNext disabled={!value} onClick={() => onChoose(value ?? "", true)} />
    </fieldset>
  );
}

function TimeGrid({
  status,
  data,
  expected,
  selected,
  holding,
  onPick,
  onRetry,
  onBack,
  error,
}: {
  status: string;
  data: SlotsResponse | undefined;
  expected: number;
  selected: string | null;
  holding: boolean;
  onPick: (t: string) => void;
  onRetry: () => void;
  onBack: () => void;
  error?: string;
}) {
  const grid = "mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6";
  if (status === "loading" || status === "idle") {
    return (
      <div className={grid} aria-busy="true" aria-label="Загружаем свободное время">
        {Array.from({ length: Math.max(expected, 4) }, (_, i) => (
          <Skeleton key={i} className="h-12 rounded-[var(--radius)]" />
        ))}
      </div>
    );
  }
  if (status === "error") {
    return (
      <div role="alert" className="mt-4 flex flex-col items-start gap-3 rounded-[var(--radius)] border border-line p-4">
        <p>{error ?? "Расписание не загрузилось"}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw aria-hidden="true" />
          Повторить
        </Button>
      </div>
    );
  }
  if (status === "empty" || !data) {
    return (
      <div className="mt-4 flex flex-col items-start gap-3 rounded-[var(--radius)] border border-line p-4">
        <p>{data?.closed ? "В этот день мы закрыты." : "На этот день свободного времени не осталось."}</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Выбрать другой день
        </Button>
      </div>
    );
  }
  return (
    <div className={grid} role="group" aria-label="Свободное время">
      {data.slots.map((s) => {
        const isSel = selected === s.time;
        return (
          <button
            key={s.time}
            type="button"
            disabled={!s.available || (holding && !isSel)}
            aria-pressed={isSel}
            onClick={() => onPick(s.time)}
            className={cn(
              "tabular relative flex h-12 items-center justify-center rounded-[var(--radius)] border text-[0.95rem] transition-colors",
              isSel
                ? "border-brand bg-brand text-brand-ink"
                : s.available
                  ? "border-line hover:border-line-strong"
                  : "border-transparent text-fg-muted line-through opacity-50",
            )}
          >
            {isSel && holding ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : s.time}
            {!s.available ? <span className="sr-only"> занято</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-fg-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
