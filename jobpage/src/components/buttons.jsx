
import { forwardRef } from "react";
import { Link } from "react-router-dom";

const base =
  "px-4 py-2 rounded-md bg-primary text-white font-semibold " +
  "transition transform active:scale-95 hover:bg-primaryHover";

const JbwButton = forwardRef(
  ({ to, href, className = "", children, ...rest }, ref) => {
    const cls = `${base} ${className}`;

    if (to)   return (
      <Link ref={ref} to={to} className={cls} {...rest}>
        {children}
      </Link>
    );

    if (href) return (
      <a ref={ref} href={href} className={cls} {...rest}>
        {children}
      </a>
    );

    return (
      <button ref={ref} className={cls} {...rest}>
        {children}
      </button>
    );
  }
);



  export default JbwButton;