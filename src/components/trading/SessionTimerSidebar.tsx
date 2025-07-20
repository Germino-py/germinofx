import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

// Définition des sessions de trading
const sessions = [
  { name: 'London', timezone: 'Europe/London', startHour: 8, endHour: 10, color: 'text-cyan-400' },
  { name: 'New York', timezone: 'America/New_York', startHour: 9, endHour: 11, color: 'text-cyan-400' },
  { name: 'Asian', timezone: 'Asia/Tokyo', startHour: 20, endHour: 22, color: 'text-cyan-400' },
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
        
        const nowInNextSessionTz = new Date(new Date().toLocaleString('en-US', { timeZone: nextSession.timezone }));
        
        return {
            status: 'PRE_SESSION',
            name: `Session ${nextSession.name}`,
            message: 'Ouverture dans :',
            countdown: formatTime(nextSession.time.getTime() - nowInNextSessionTz.getTime()),
            ...nextSession
        };
    };
    
    const { name, message, countdown, color } = getSessionStatus();

    const WateryGlassCircle = ({ size, children }: { size: string, children: React.ReactNode }) => (
      <div 
        className="relative rounded-full flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Effet de verre */}
        <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"></div>
        {/* Vague animée */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[200%] h-[200%] bg-cyan-400/20 animate-[spin_10s_linear_infinite] origin-[50%_50%] rounded-[45%]"></div>
        </div>
        {/* Contenu */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );


    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger className="w-full flex justify-center py-4 border-t border-sidebar-border/50">
                        <WateryGlassCircle size="36px">
                            <Clock className="w-4 h-4 text-white/70" />
                        </WateryGlassCircle>
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
        <div className="px-4 py-4 mt-4 flex flex-col items-center text-center">
            <WateryGlassCircle size="130px">
              <div className="flex flex-col items-center">
                  <span className="font-mono text-2xl font-bold text-white/90 tracking-wider">{countdown}</span>
                  <span className={cn("text-xs font-semibold", color)}>{name}</span>
              </div>
            </WateryGlassCircle>
            <p className="text-xs text-sidebar-foreground/60 mt-4">{message}</p>
        </div>
    );
};