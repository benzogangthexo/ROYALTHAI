import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

import { Magnetic } from "./magnetic";

type Props = ComponentProps<typeof Button> & { strength?: number; wrapperClassName?: string };

/** Кнопка/ссылка с магнитным ховером */
export function MagneticButton({ strength, wrapperClassName, ...props }: Props) {
  return (
    <Magnetic strength={strength} className={wrapperClassName}>
      <Button {...props} />
    </Magnetic>
  );
}
