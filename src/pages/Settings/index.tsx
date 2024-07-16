import { useEffect, useState } from "react";
import { loadSettings, saveToSettings } from "../../utils/storage.ts";
import { useToast } from "../../context/toastContext.tsx";

const Settings = () => {
    const [dashboardName, setDashboardName] = useState("");
    const [settings, setSettings] = useState([{ name: "bla", url: "bla" }]);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setDashboardName(dashboardName);
                setSettings(settings);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        fetchSettings();
    }, []);

    const save = async () => {
        await saveToSettings("settings", settings, addToast);
    };

    const load = async () => {
        const settings = await loadSettings("settings", addToast);
        console.log("retrieved settings from storage", settings);
    }

    return (
        <div className="p-4">
            <button onClick={save}>Save</button>
            <br/>
            <button onClick={load}>Load</button>
        </div>
    );
};

export default Settings;


// import { invoke } from "@tauri-apps/api/tauri";
// import { Command } from "../../enums/command.enum.ts";

// const deleteSetting = (index: number) => {
//     const newSettings = settings.filter((_, i) => i !== index);
//     setSettings(newSettings);
// };
//
// const saveSettings = async () => {
//     try {
//         await invoke(Command.SaveSettings, { dashboardName, settings });
//     } catch (error) {
//         console.error('Error saving settings:', error);
//     }
// };
