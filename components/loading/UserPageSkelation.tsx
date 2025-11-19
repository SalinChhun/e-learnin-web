"use client"

import "@/styles/skelation.css"
import CardSkeleton from "./CardSkelaton"
import TabSkeleton from "./TabSkelaton"
import DateFilterSkelaton from "./DateFilterSkelaton"
import TableSkeleton from "./TableSakelaton"

const UserPageSkelation = ({ }) => {
    return (
        <>
            <main className="content">
               <DateFilterSkelaton/>

                <CardSkeleton/>

                <TabSkeleton/>

                <TableSkeleton rowCount={4}/>

            </main>
        </>
    )
}

export default UserPageSkelation