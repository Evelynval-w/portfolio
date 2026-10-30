import { useReveal } from '../hooks.js'

/** Wrapper that fades and lifts its content in once, staggered by `i`. */
export default function Rise({ as: Tag = 'div', i = 0, className = '', children, ...rest }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`rise ${className}`} style={{ '--i': i }} {...rest}>
      {children}
    </Tag>
  )
}

export function Spark({ className = '', size = 28, style }) {
  return (
    <svg className={`spark ${className}`} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.7 6.2 5.8 11.3 12 12-6.2.7-11.3 5.8-12 12-.7-6.2-5.8-11.3-12-12C6.2 11.3 11.3 6.2 12 0Z" fill="currentColor" />
    </svg>
  )
}
