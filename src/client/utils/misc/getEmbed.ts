import randomColor from "./randomColor";

export default (title: string, description: string, icon_url: string) => {
    return {
        embeds: [{
            title,
            description,
            color: randomColor(),
            timestamp: (new Date()).toISOString(),
            footer: {
                text: '7/24 Classical Music Bot',
                // Icon url needs client. I dont want to connect this function to client I want a independence function in here.
                icon_url,
            },
        }],
        flags: 64,
    };
};
