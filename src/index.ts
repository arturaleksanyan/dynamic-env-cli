const __env__: string = "___ENV-VARIABLES___"



export function getEnvVariable(key: string): string | undefined {


    if (!key) throw new Error('Key is required');



    const environment: string = process.env.NODE_ENV || 'development';

    if (environment === 'development') {

        return process.env[key];

    } else if (environment === 'production') {

        if (__env__ === `___${"ENV-VARIABLES"}___`) {
            console.error(`[ERROR] Environment variables are not injected yet. Please ensure the "run.sh" script has executed successfully or that the variables were injected properly during deployment.`);
            return undefined;
        } else {


            const env = __env__.split("<<>>")



            for (let i = 0; i < env.length; i++) {
                const [_key, value] = env[i].split(">><<");

                if (_key === key) {
                    return value;
                }

            }

            return undefined;
        }
    }
    throw new Error(`Environment ${environment} is not supported`);
}

