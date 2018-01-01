﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import * as Utility from '../../Utility';
import Post from './ExactActivitiesPost';
import { UserRecentPost } from '../../States/AppState';
import Pager from './Pager';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getRecentPosts } from '../../AsyncActions/UserCenter';
import { Actions } from '../../Actions/UserCenter';
import { RootState } from '../../Store';

interface Props {
    userRecentPosts: UserRecentPost[];
    totalPage: number;
    hasTotal: boolean;
    isLoading: boolean;
    match: any;
    getInfo: (page: number) => void;
    changePage: () => void;
}

/**
 * 用户中心我的主题组件
 */
class MyPosts extends React.Component<Props> {
    componentWillReceiveProps(newProps: Props){
        if(this.props.match.params.page !== newProps.match.params.page) {
            window.scroll(0, 0);
        }
    }

    componentDidMount() {
        this.props.changePage();
    }

    render() {
        if(this.props.isLoading) {
            return <div className="user-center-loading"><p className="fa fa-spinner fa-pulse fa-2x fa-fw"></p></div>;
        }
        const curPage = parseInt(this.props.match.params.page) || 1;
        const totalPage = this.props.hasTotal ? this.props.totalPage : curPage + 1;
        //如果未请求完所有帖子并且帖子总数小于请求的页数
        //换言之，当用户向后翻页，或直接通过url定位页数时
        let shouldLoad = this.props.userRecentPosts.length < (curPage - 1) * 10 + 1 && !this.props.hasTotal;
        //当用户向前翻页，且翻页后的部分中存在undefined时
        //仅当用户通过url定位页数后向前翻页才会出现的情况
        for(let i = (curPage - 1) * 10; i < Math.min(this.props.userRecentPosts.length, curPage * 10); i++){
            if(!this.props.userRecentPosts[i]){
                shouldLoad = true;
                break;
            }
        }
        
        if(shouldLoad) {
            this.props.getInfo(curPage);
            return <div className="user-center-loading"><p className="fa fa-spinner fa-pulse fa-2x fa-fw"></p></div>;
        } else if(this.props.userRecentPosts.length === 0) {
            return <div className="user-posts" style={{ textAlign: 'center' }}>没有主题</div>;
        }
        //state转换为JSX
        let userRecentPosts = this.props.userRecentPosts.slice((curPage - 1) * 10, curPage * 10 - 1).map((item) => (<Post userRecentPost={item} />));
        //添加分隔线
        for (let i = 1; i < userRecentPosts.length; i += 2) {
            userRecentPosts.splice(i, 0, <hr />);
        }
        return (
            <div className="user-posts">
                {userRecentPosts}
                <Pager currentPage={curPage} totalPage={totalPage} href="/usercenter/myposts/" hasTotal={this.props.hasTotal}/>
            </div>
        );
    }
}


function mapState(store: RootState) {
    return {
        userRecentPosts: store.userInfo.recentPosts,
        totalPage: store.userInfo.totalPage.myposts,
        hasTotal: store.userInfo.hasTotal.myposts,
        isLoading: store.userInfo.isLoading
    };
}

function mapDispatch(dispatch) {
    return {
        getInfo: (page:number) => {
            dispatch(getRecentPosts(page));
        },
        changePage: () => {
            dispatch(Actions.changeUserCenterPage('myposts'));
        }
    };
}

export default withRouter(connect(mapState, mapDispatch)(MyPosts));