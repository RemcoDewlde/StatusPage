export const DetailsView = (props: { api: string }) => {

    console.log('DetailsView', props.api);

    return (
        <div>
            <h1>Details View</h1>
            <p>API: {props.api}</p>
        </div>
    );
};
