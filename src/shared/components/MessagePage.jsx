import { Link } from 'react-router-dom';
import AppHeader from './AppHeader';

export default function MessagePage({ 
    title, 
    description, 
    buttonText = "Back to Dashboard", 
    buttonLink = "/",
    secondaryButtonText,
    onSecondaryAction,
    icon: IconComponent
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="mx-auto w-full max-w-xl bg-surface border border-border rounded-card p-8 sm:p-12 shadow-soft text-center flex flex-col items-center">
                    {IconComponent && (
                        <div className="bg-primary/10 p-4 rounded-full text-primary mb-6 inline-flex">
                            <IconComponent size={36} />
                        </div>
                    )}
                    <h1 className="mb-3 text-2xl sm:text-3xl font-bold text-heading tracking-tight">{title}</h1>
                    <p className="mb-8 text-sm sm:text-base text-muted whitespace-pre-wrap leading-relaxed max-w-md">{description}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                        <Link
                            to={buttonLink}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out bg-primary text-surface hover:bg-primary-hover shadow-soft px-6 py-2.5 w-full sm:w-auto"
                        >
                            {buttonText}
                        </Link>
                        {secondaryButtonText && onSecondaryAction && (
                            <button
                                onClick={onSecondaryAction}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 ease-out border border-border bg-surface text-body hover:bg-background px-6 py-2.5 w-full sm:w-auto"
                            >
                                {secondaryButtonText}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
