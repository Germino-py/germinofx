import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Globe, Clock } from 'lucide-react';

// Définition des sessions de trading avec leurs fuseaux horaires et couleurs
// Horaires en HEURE LOCALE de la ville (ex: 8 pour 8h du matin)
const sessions = [
  { name: 'London', timezone: 'Europe/London', startHour: 8, endHour: 10, color: 'text-cyan-400', ringColor: 'hsl(180, 80%, 60%)' },
  { name: 'New York', timezone: 'America/New_York', startHour: 9, endHour: 11, color: 'text-purple-400', ringColor: 'hsl(260, 80%, 70%)' },
  { name: 'Asian', timezone: 'Asia/Tokyo', startHour: 20, endHour: 22, color: 'text-red-400', ringColor: 'hsl(0, 80%, 70%)' },
];

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
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getSessionStatus = () => {
        const now = currentTime;
        const upcomingSessions = [];

        // 1. Chercher une session active
        for (const session of sessions) {
            const formatter = new Intl.DateTimeFormat('en-US', { timeZone: session.timezone, hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' });
            const parts = formatter.formatToParts(now);
            const nowInSessionTz = new Date(parts.map(p => p.value).join(''));
            
            const dayOfWeek = nowInSessionTz.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            const start = new Date(nowInSessionTz);
            start.setHours(session.startHour, 0, 0, 0);

            const end = new Date(nowInSessionTz);
            end.setHours(session.endHour, 0, 0, 0);

            if (nowInSessionTz >= start && nowInSessionTz <= end) {
                return {
                    status: 'IN_SESSION',
                    name: `Session ${session.name}`,
                    message: 'Fermeture dans :',
                    countdown: formatTime(end.getTime() - nowInSessionTz.getTime()),
                    progress: ((end.getTime() - nowInSessionTz.getTime()) / (end.getTime() - start.getTime())) * 100,
                    ...session
                };
            }

            if (nowInSessionTz < start) {
                upcomingSessions.push({ time: start, ...session });
            } else {
                 const nextDayStart = new Date(start);
                 nextDayStart.setDate(start.getDate() + 1);
                 if (nextDayStart.getDay() === 6) nextDayStart.setDate(nextDayStart.getDate() + 2);
                 if (nextDayStart.getDay() === 0) nextDayStart.setDate(nextDayStart.getDate() + 1);
                 upcomingSessions.push({ time: nextDayStart, ...session });
            }
        }

        // 2. Si aucune session n'est active, trouver la prochaine
        upcomingSessions.sort((a, b) => a.time.getTime() - b.time.getTime());
        const nextSession = upcomingSessions[0];
        
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: nextSession.timezone, hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' });
        const parts = formatter.formatToParts(now);
        const nowInNextSessionTz = new Date(parts.map(p => p.value).join(''));
        
        return {
            status: 'PRE_SESSION',
            name: `Session ${nextSession.name}`,
            message: 'Ouverture dans :',
            countdown: formatTime(nextSession.time.getTime() - nowInNextSessionTz.getTime()),
            progress: 100,
            ...nextSession
        };
    };
    
    const { status, name, message, countdown, progress, color, ringColor } = getSessionStatus();

    const Ring = ({ size, isCollapsedView = false }: { size: number, isCollapsedView?: boolean }) => (
        <div
            className={cn(
                "relative flex items-center justify-center rounded-full p-1 transition-all duration-500",
                isCollapsedView ? "bg-[radial-gradient(closest-side,_hsl(var(--sidebar-accent))_79%,_transparent_80%_100%)]" : "bg-[radial-gradient(closest-side,_hsl(var(--sidebar-background))_79%,_transparent_80%_100%)]"
            )}
            style={{ 
                width: size, 
                height: size,
                backgroundImage: `
                    radial-gradient(closest-side, ${isCollapsedView ? 'hsl(var(--sidebar-accent))' : 'hsl(var(--sidebar-background))'} 79%, transparent 80% 100%),
                    conic-gradient(${ringColor} ${progress}%, hsl(var(--sidebar-border)) 0)
                `
             }}
        >
            {isCollapsedView ? <Clock className="w-4 h-4 text-sidebar-foreground" /> : null}
        </div>
    );

    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger className="w-full flex justify-center py-4 border-t border-sidebar-border/50">
                        <div className="relative flex items-center justify-center">
                             <Ring size={32} isCollapsedView />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                        <p className={cn("font-semibold", color)}>{name}</p>
                        <p>{message} {countdown}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="px-4 py-4 mt-4 border-t border-sidebar-border/50 flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center">
                <Ring size={120} />
                <div className="absolute flex flex-col">
                    <span className="font-mono text-2xl font-bold text-sidebar-foreground">{countdown}</span>
                    <span className={cn("text-xs font-semibold", color)}>{name}</span>
                </div>
            </div>
            <p className="text-xs text-sidebar-foreground/60 mt-3">{message}</p>
        </div>
    );
};