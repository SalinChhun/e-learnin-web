import { NextPage } from 'next'
import "@/styles/loading.module.css"

interface Props {}

const LoadingComponent: NextPage<Props> = ({}) => {
  return <span>Loading</span>
}

export default LoadingComponent