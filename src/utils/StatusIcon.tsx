import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

const StatusPageIcon = ({ status }: { status: string }) => {
    switch (status) {
        case "operational":
            return <CheckCircle className="text-green-500" />;
        case "degraded_performance":
        case "partial_outage":
            return <AlertCircle className="text-yellow-500" />;
        case "major_outage":
            return <XCircle className="text-red-500" />;
        case"maintenance":
            return <AlertCircle className="text-blue-500" />;
        case "unknown":
            return <AlertCircle className="text-gray-500" />;
        case "re-routed":
            return <AlertCircle className="text-purple-500" />;
        default:
            return null;
    }
};

export default StatusPageIcon;