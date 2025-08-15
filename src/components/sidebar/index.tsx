import { ElementType, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../@/lib/utils.ts';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ClipboardPlus, Home, Menu, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFormDialogStore } from '@/store/formDialogStore';
import { useDnDStore } from '@/store/dndStore';
import { useSettingsDialogStore } from '@/store/settingsDialogStore';

interface SidebarItemProps {
    icon: ElementType;
    label: string;
    path?: string;
    onClick?: () => void;
    children?: {
        label: string;
        path: string;
    }[];
    isCollapsed: boolean;
}

const SidebarItem = ({ icon: Icon, label, path, onClick, children, isCollapsed }: SidebarItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isActive = path ? location.pathname === path : false;

    if (children) {
        return (
            <div className={cn('flex flex-col', !isCollapsed && 'space-y-1')}>
                <Button
                    variant="ghost"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-full justify-between',
                        !isCollapsed && 'px-2',
                        isActive && 'bg-muted',
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{label}</span>}
                    </div>
                    {!isCollapsed && (
                        isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
                {isOpen && !isCollapsed && (
                    <div className="pl-4 space-y-1">
                        {children.map((child) => (
                            <Link key={child.path} to={child.path}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'w-full justify-start pl-6',
                                        location.pathname === child.path && 'bg-muted',
                                    )}
                                >
                                    {child.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (path) {
        return (
            <Link to={path}>
                <Button
                    variant="ghost"
                    className={cn(
                        'w-full justify-start',
                        !isCollapsed && 'px-2',
                        isActive && 'bg-muted',
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">{label}</span>}
                </Button>
            </Link>
        );
    }

    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
                'w-full justify-start',
                !isCollapsed && 'px-2',
            )}
        >
            <Icon className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">{label}</span>}
        </Button>
    );
};
const TilePalette = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const startDrag = useDnDStore((s) => s.startDrag)
    const endDrag = useDnDStore((s) => s.endDrag)
    const items = [
        { kind: "summary", label: "Summary", icon: "📊" },
        { kind: "graph", label: "Graph", icon: "📈" },
        { kind: "welcome", label: "Welcome", icon: "👋" },
        { kind: "dev", label: "Dev", icon: "⚡" },
    ]

    const getTileStyles = (kind: string) => {
        const baseStyles =
            "group cursor-grab active:cursor-grabbing relative overflow-hidden rounded-md border px-3 py-2 text-sm font-medium select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"

        switch (kind) {
            case "summary":
                return `${baseStyles} bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 text-slate-700 hover:shadow-md hover:shadow-slate-200/50`
            case "graph":
                return `${baseStyles} bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-300 text-emerald-700 hover:shadow-md hover:shadow-emerald-200/50`
            case "welcome":
                return `${baseStyles} bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 border-violet-300 text-violet-700 hover:shadow-md hover:shadow-violet-200/50`
            case "dev":
                return `${baseStyles} bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-300 text-amber-700 hover:shadow-md hover:shadow-amber-200/50`
            default:
                return `${baseStyles} bg-muted/40 hover:bg-muted/60 border-border text-foreground`
        }
    }

    return (
        <div className="mt-4 space-y-2">
            {items.map((it) => (
                <div
                    key={it.kind}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", it.kind)
                        e.dataTransfer.effectAllowed = "copy"
                        const crt = document.createElement("div")
                        crt.style.padding = "8px 12px"
                        crt.style.position = "fixed"
                        crt.style.top = "-1000px"
                        crt.style.fontSize = "13px"
                        crt.style.fontWeight = "500"
                        crt.style.fontFamily = "system-ui, sans-serif"
                        crt.style.background = "hsl(var(--muted))"
                        crt.style.color = "hsl(var(--foreground))"
                        crt.style.borderRadius = "6px"
                        crt.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
                        crt.style.border = "1px solid hsl(var(--border))"
                        crt.textContent = `${it.icon} ${it.label}`
                        document.body.appendChild(crt)
                        try {
                            e.dataTransfer.setDragImage(crt, 12, 12)
                        } catch {}
                        setTimeout(() => {
                            document.body.removeChild(crt)
                        }, 0)
                        startDrag(it.kind)
                    }}
                    onDragEnd={() => {
                        endDrag()
                    }}
                    className={getTileStyles(it.kind)}
                    title={`Drag to add ${it.label}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                    <div className="flex items-center gap-2 relative z-10">
                        <span className="text-sm leading-none">{it.icon}</span>
                        {!isCollapsed && <span>{it.label}</span>}
                        {isCollapsed && <span className="sr-only">{it.label}</span>}
                    </div>
                </div>
            ))}
        </div>
    )
}

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const openDialog = useFormDialogStore(s => s.openDialog);
    const openSettings = useSettingsDialogStore(s => s.open);

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: ClipboardPlus, label: 'Add Status Tile', onClick: () => openDialog() },
        { icon: Settings, label: 'Settings', onClick: () => openSettings() },
    ];

    const Sidebar = (
        <div
            className={cn(
                'flex flex-col h-screen bg-background border-r transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64',
            )}
        >
            <div className="flex items-center justify-between p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8"
                >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-2">
                    {sidebarItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            {...item}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                    <div className="pt-2 border-t text-[10px] uppercase tracking-wide text-muted-foreground">Drag to add</div>
                    <TilePalette isCollapsed={isCollapsed} />
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <>
            <div className="hidden md:block">
                {Sidebar}
            </div>
        </>
    );
};

export default Sidebar;
