import { NextPage } from 'next'

interface Props {
    status: string
}

const LabelStatus: NextPage<Props> = ({ status }) => {

    switch (status) {
        case 'ENABLE':
        case 'Enable':
        case'ACTIVE':
        case'Active':
            return ( <span className="d-inline-flex wl-badge-guide wl-badge-guide-paid">Active</span>)
        case 'DISABLE':
        case 'Disable':
        case 'INACTIVE':
        case 'Inactive':
            return ( <span className="d-inline-flex wl-badge-guide wl-badge-guide-partially">Inactive</span> )
        case '1':
        case 'ENABLED':
        case 'Enabled':
            return (<span className="d-inline-flex wl-badge-guide wl-badge-guide-progress  ">Enabled</span>)
        case '2':
        case 'DISABLED':
        case 'Disabled':
            return (<span className="d-inline-flex wl-badge-guide ">Disabled</span>)
        default:
            return <></>
    }

}

export default LabelStatus