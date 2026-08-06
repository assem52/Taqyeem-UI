import MessagePage from './MessagePage';
import { AlertCircle } from './Icons';

export default function NotFound() {
  return (
    <MessagePage 
      icon={AlertCircle}
      title="Page not found" 
      description="The page you are looking for does not exist." 
    />
  );
}
