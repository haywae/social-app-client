import type { JSX } from "react";
import PostFeed from "../components/posts/postFeed";
import TabbedHeader from "../components/common/tabbedHeader";

const Home = (): JSX.Element => {

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