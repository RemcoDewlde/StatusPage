import { ElementType, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../@/lib/utils.ts';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Home, Menu, ClipboardPlus, Settings, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFormDialog } from '@/context/FormDialogContext';
import { useMosaicDrawer } from '@/context/MosaicDrawerContext';

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

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { openDialog } = useFormDialog();
    const { setDrawerOpen } = useMosaicDrawer();

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Plus, label: 'Add View', onClick: () => setDrawerOpen(true) },
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

