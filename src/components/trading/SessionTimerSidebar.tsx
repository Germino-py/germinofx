import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Globe, Clock } from 'lucide-react';

// Définition des sessions avec couleurs pour la lueur
const sessions = [
  { name: 'London', timezone: 'Europe/London', startHour: 8, endHour: 10, color: 'text-cyan-400', ringColor: 'hsl(180, 80%, 60%)', glowColor: 'rgba(74, 222, 255, 0.5)' },
  { name: 'New York', timezone: 'America/New_York', startHour: 9, endHour: 11, color: 'text-purple-400', ringColor: 'hsl(260, 80%, 70%)', glowColor: 'rgba(192, 132, 252, 0.5)' },
  { name: 'Asian', timezone: 'Asia/Tokyo', startHour: 20, endHour: 22, color: 'text-red-400', ringColor: 'hsl(0, 80%, 70%)', glowColor: 'rgba(248, 113, 113, 0.5)' },
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

        for (const session of sessions) {
            const formatter = new Intl.DateTimeFormat('en-US', { timeZone: session.timezone, hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' });
            const parts = formatter.formatToParts(now);
            const nowInSessionTz = new Date(parts.map(p => p.value).join(''));
            
            const dayOfWeek = nowInSessionTz.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            const start = new Date(nowInSessionTz); start.setHours(session.startHour, 0, 0, 0);
            const end = new Date(nowInSessionTz); end.setHours(session.endHour, 0, 0, 0);

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

        upcomingSessions.sort((a, b) => a.time.getTime() - b.time.getTime());
        const nextSession = upcomingSessions[0];
        
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: nextSession.timezone, hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' });
        const nowInNextSessionTz = new Date(new Date().toLocaleString('en-US', { timeZone: nextSession.timezone }));

        return {
            status: 'PRE_SESSION',
            name: `Session ${nextSession.name}`,
            message: 'Ouverture dans :',
            countdown: formatTime(nextSession.time.getTime() - nowInNextSessionTz.getTime()),
            progress: 100,
            ...nextSession
        };
    };
    
    const { name, message, countdown, progress, color, ringColor, glowColor } = getSessionStatus();

    const Ring = ({ size, isCollapsedView = false }: { size: number, isCollapsedView?: boolean }) => (
        <div
            className={cn( "relative flex items-center justify-center rounded-full p-1 transition-all duration-500 timer-ring-glow")}
            style={{ 
                width: size, height: size,
                backgroundImage: `
                    radial-gradient(closest-side, ${isCollapsedView ? 'hsl(var(--sidebar-accent))' : 'transparent'} 79%, transparent 80% 100%),
                    conic-gradient(${ringColor} ${progress}%, hsl(var(--sidebar-border)) 0)
                `,
                // @ts-ignore
                '--ring-color-glow': glowColor
             } as React.CSSProperties}
        >
            {isCollapsedView && <Clock className="w-4 h-4 text-sidebar-foreground" />}
        </div>
    );

    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger className="w-full flex justify-center py-4 border-t border-sidebar-border/50">
                        <Ring size={32} isCollapsedView />
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
        <div className="px-4 py-4 mt-4 rounded-lg mx-2 session-timer-glass">
            <div className="relative flex items-center justify-center">
                <Ring size={120} />
                <div className="absolute flex flex-col items-center">
                    <span style={{ '--ring-color-glow': glowColor } as React.CSSProperties} className="font-mono text-2xl font-bold text-sidebar-foreground timer-text-glow">{countdown}</span>
                    <span className={cn("text-xs font-semibold", color)}>{name}</span>
                </div>
            </div>
            <p className="text-center text-xs text-sidebar-foreground/60 mt-3">{message}</p>
        </div>
    );
};