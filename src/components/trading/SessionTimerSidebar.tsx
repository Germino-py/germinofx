import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Heures de la session en fuseau horaire de New York (ET).
// 9:30 à 11:00 ET correspond à 15:30 à 17:00 Heure de Paris (en été).
const SESSION_START_HOUR_ET = 9;
const SESSION_START_MINUTE_ET = 30;
const SESSION_END_HOUR_ET = 11;
const SESSION_END_MINUTE_ET = 0;
const SESSION_DURATION_MS = (SESSION_END_HOUR_ET * 60 + SESSION_END_MINUTE_ET - (SESSION_START_HOUR_ET * 60 + SESSION_START_MINUTE_ET)) * 60 * 1000;

const getTimeInNewYork = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
const getSessionDateInET = (date: Date, hour: number, minute: number) => {
    const sessionDate = new Date(date.getTime());
    sessionDate.setHours(hour, minute, 0, 0);
    return sessionDate;
};

const formatTime = (ms: number) => {
    if (ms < 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const SessionTimerSidebar = () => {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const [countdown, setCountdown] = useState('00:00:00');
    const [status, setStatus] = useState<'PRE_SESSION' | 'IN_SESSION'>('PRE_SESSION');
    const [message, setMessage] = useState('Chargement...');
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const nowET = getTimeInNewYork();
            let startOfSession = getSessionDateInET(nowET, SESSION_START_HOUR_ET, SESSION_START_MINUTE_ET);
            let endOfSession = getSessionDateInET(nowET, SESSION_END_HOUR_ET, SESSION_END_MINUTE_ET);

            if (nowET.getTime() > endOfSession.getTime() || nowET.getDay() === 0 || nowET.getDay() === 6) {
                let nextDay = new Date(nowET);
                nextDay.setDate(nowET.getDate() + 1);
                if (nextDay.getDay() === 6) nextDay.setDate(nextDay.getDate() + 2);
                else if (nextDay.getDay() === 0) nextDay.setDate(nextDay.getDate() + 1);
                startOfSession = getSessionDateInET(nextDay, SESSION_START_HOUR_ET, SESSION_START_MINUTE_ET);
            }

            if (nowET.getTime() >= startOfSession.getTime() && nowET.getTime() <= endOfSession.getTime()) {
                const timeRemaining = endOfSession.getTime() - nowET.getTime();
                setStatus('IN_SESSION');
                setMessage('Session en cours');
                setCountdown(formatTime(timeRemaining));
                setProgress((timeRemaining / SESSION_DURATION_MS) * 100);
            } else {
                const timeToStart = startOfSession.getTime() - nowET.getTime();
                setStatus('PRE_SESSION');
                setMessage('Prochaine session');
                setCountdown(formatTime(timeToStart));
                setProgress(100); // L'anneau est plein avant la session
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const progressStyle = { '--progress': `${progress}%` } as React.CSSProperties;

    // Affiche une vue compacte lorsque la barre est repliée
    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger className="w-full flex justify-center py-4 border-t border-sidebar-border/50">
                        <div
                            style={progressStyle}
                            className={cn(
                                "relative flex items-center justify-center h-9 w-9 rounded-full p-1",
                                "bg-[radial-gradient(closest-side,_hsl(var(--sidebar-accent))_79%,_transparent_80%_100%),conic-gradient(hsl(var(--primary))_var(--progress),_hsl(var(--sidebar-border))_0)]",
                                status === 'PRE_SESSION' && "bg-[radial-gradient(closest-side,_hsl(var(--sidebar-accent))_79%,_transparent_80%_100%),conic-gradient(hsl(var(--sidebar-border))_var(--progress),_hsl(var(--sidebar-border))_0)]"
                            )}
                        >
                             <Clock className="w-4 h-4 text-sidebar-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                        <p className="font-semibold">Session NY</p>
                        <p>{status === 'IN_SESSION' ? 'Ferme dans' : 'Ouvre dans'} {countdown}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Affiche la vue complète lorsque la barre est étendue
    return (
        <div className="px-4 py-4 mt-4 border-t border-sidebar-border/50 flex flex-col items-center text-center">
            <div
                style={progressStyle}
                className={cn(
                    "relative flex items-center justify-center h-32 w-32 rounded-full p-1 transition-all duration-500",
                    "bg-[radial-gradient(closest-side,_hsl(var(--sidebar-background))_79%,_transparent_80%_100%),conic-gradient(hsl(var(--primary))_var(--progress),_hsl(var(--sidebar-border))_0)]",
                    status === 'PRE_SESSION' && "bg-[radial-gradient(closest-side,_hsl(var(--sidebar-background))_79%,_transparent_80%_100%),conic-gradient(hsl(var(--sidebar-border))_var(--progress),_hsl(var(--sidebar-border))_0)]"
                )}
            >
                <div className="absolute flex flex-col">
                    <span className="font-mono text-2xl font-bold text-primary">{countdown}</span>
                    <span className="text-xs text-sidebar-foreground/60">{message}</span>
                </div>
            </div>
            <p className="text-sm text-sidebar-foreground/80 font-medium mt-3">Session de New York</p>
        </div>
    );
};