export default function Skeleton({ className = '', variant = 'default' }) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    default: '',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    circle: 'rounded-full',
    card: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}
