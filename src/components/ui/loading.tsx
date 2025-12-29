import "./globals.css";
interface LoadingProps {
  message?: string;
}
const Loading = ({ message }: LoadingProps) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="loader"></div>
        <div className="text-lg font-medium mt-5 text-gray-700 dark:text-gray-300">
          {message || "Cargando..."}
        </div>
      </div>
    </div>
  )
}

export default Loading
