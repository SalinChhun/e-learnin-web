import { NextPage } from 'next'

interface Props { }

const DateFilterSkelaton: NextPage<Props> = ({ }) => {
    return <div className="date-filter">
        <div className="skeleton-date-filter"></div>
    </div>
}

export default DateFilterSkelaton