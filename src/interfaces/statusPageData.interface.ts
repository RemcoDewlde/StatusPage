import { Component } from "./component.interface.ts";
import { Page } from "./page.interface.ts";

export interface StatusPageData {
    page: Page;
    components: Component[];
    incidents: any[];
    scheduled_maintenances: any[];
    status: {
        indicator: string;
        description: string;
    };
}