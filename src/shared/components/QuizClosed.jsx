import { useNavigate } from 'react-router-dom';
import MessagePage from './MessagePage';
import { MailX } from './Icons';

export default function QuizClosed() {
    const navigate = useNavigate();
    return (
        <MessagePage 
            icon={MailX}
            title="Quiz Closed" 
            description={"This quiz is no longer available.\nThe submission window has ended or the invitation has expired."}
            secondaryButtonText="Go Back"
            onSecondaryAction={() => navigate(-1)}
        />
    );
}
