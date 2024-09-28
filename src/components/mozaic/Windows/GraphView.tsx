export const GraphView = (props: { api: string, additionalSettings: Record<string, any> | undefined }) => {
    return (
        <div>
            <h1>Graph View</h1>
            <p>API: {props.api}</p>
            <p>Additional Settings: {JSON.stringify(props.additionalSettings)}</p>
            {props.additionalSettings?.chartType}
        </div>
    );
};
