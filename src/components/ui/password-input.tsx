import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Password field with a show/hide toggle — standard practice on any login/
 * register/reset form so people can check what they typed instead of
 * guessing. Wraps the existing Input rather than duplicating its styles.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          aria-pressed={visible}
          // Overrides the site-wide default (buttons hover red) via the same
          // --hover-accent mechanism the rest of the site uses, rather than
          // fighting it with a plain Tailwind hover: utility of equal
          // specificity.
          style={{ '--hover-accent': 'hsl(var(--foreground))' } as React.CSSProperties}
          className="absolute right-0 top-0 h-full px-3 flex items-center text-muted-foreground transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
