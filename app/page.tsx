import Home from "@/components/views/home";
import { getGithubData } from "@/lib/github";

/** The page is rebuilt at most once an hour, which is also how often GitHub is asked. */
export const revalidate = 3600;

export default async function Page() {
    const github = await getGithubData();
    return <Home github={github} />;
}
