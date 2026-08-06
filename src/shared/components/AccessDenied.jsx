import { useNavigate } from 'react-router-dom';
import MessagePage from './MessagePage';
import { Lock } from './Icons';

export default function AccessDenied() {
    const navigate = useNavigate();
    return (
        <MessagePage 
            icon={Lock}
            title="Access Restricted" 
            description={"You don't currently have permission to access this quiz.\nIf you believe this is a mistake,\nplease contact your instructor."} 
            secondaryButtonText="Go Back"
            onSecondaryAction={() => navigate(-1)}
        />
    );
}
