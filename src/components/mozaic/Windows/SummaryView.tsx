export const SummaryView = (props: { api: string }) => {
    return (
        <div>
            <h1>Summary View</h1>
            <p>API: {props.api}</p>
        </div>
    );
};
