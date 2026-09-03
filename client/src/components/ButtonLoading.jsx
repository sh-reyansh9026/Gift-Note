import Spinner from './Spinner'

export default function ButtonLoading({ 
  children, 
  loading, 
  disabled, 
  className = '', 
  spinnerSize = 'sm',
  ...props 
}) {
  return (
    <button
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading && <Spinner size={spinnerSize} />}
      <span>{loading ? 'Loading...' : children}</span>
    </button>
  )
}
