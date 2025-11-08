import type { JSX } from "react";
import PostFeed from "../components/posts/postFeed";
import TabbedHeader from "../components/common/tabbedHeader";
import { useTitle } from "../utils/hooks";
const Home = (): JSX.Element => {
    useTitle('Home')
    const homeTabs = [
        { path: "/", label: "For you" },
    ];

    return (
        <>
            <TabbedHeader tabs={homeTabs} />
            <PostFeed />
        </>
    );
};

export default Home;