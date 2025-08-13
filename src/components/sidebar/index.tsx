import { ElementType, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../@/lib/utils.ts';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ClipboardPlus, Home, Menu, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFormDialogStore } from '@/store/formDialogStore';
import { useDnDStore } from '@/store/dndStore';

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
    const startDrag = useDnDStore(s => s.startDrag);
    const endDrag = useDnDStore(s => s.endDrag);
    const items = [
        { kind: 'summary', label: 'Summary Tile' },
        { kind: 'graph', label: 'Graph Tile' },
        { kind: 'welcome', label: 'Welcome Tile' },
        { kind: 'dev', label: 'Dev Tile' },
    ];
    return (
        <div className="mt-4 space-y-2">
            {items.map(it => (
                <div
                    key={it.kind}
                    draggable
                    onDragStart={(e) => {
                        // Some browsers / WebViews require at least one setData call to start a drag
                        e.dataTransfer.setData('text/plain', it.kind);
                        e.dataTransfer.effectAllowed = 'copy';
                        // Optional custom drag image for better UX
                        const crt = document.createElement('div');
                        crt.style.padding = '4px 8px';
                        crt.style.position = 'fixed';
                        crt.style.top = '-1000px';
                        crt.style.fontSize = '12px';
                        crt.style.fontFamily = 'sans-serif';
                        crt.style.background = 'rgba(59,130,246,0.9)';
                        crt.style.color = 'white';
                        crt.style.borderRadius = '4px';
                        crt.style.boxShadow = '0 2px 4px rgba(0,0,0,0.25)';
                        crt.textContent = it.label;
                        document.body.appendChild(crt);
                        try { e.dataTransfer.setDragImage(crt, 8, 8); } catch {}
                        // Cleanup after a tick (drag image snapshot is taken synchronously)
                        setTimeout(() => { document.body.removeChild(crt); }, 0);
                        startDrag(it.kind);
                    }}
                    onDragEnd={() => {
                        // If no drop target accepted it, ensure state resets
                        endDrag();
                    }}
                    className="cursor-grab active:cursor-grabbing rounded border bg-muted/40 px-2 py-1 text-xs flex items-center hover:bg-muted transition-colors select-none"
                    title={it.label}
                >
                    {!isCollapsed && <span>{it.label}</span>}
                    {isCollapsed && <span>{it.label.charAt(0).toUpperCase()}</span>}
                </div>
            ))}
        </div>
    );
};

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const openDialog = useFormDialogStore(s => s.openDialog);

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: ClipboardPlus, label: 'Add Status Tile', onClick: () => openDialog() },
        { icon: Settings, label: 'Settings', path: '/settings' },
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
