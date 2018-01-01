﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import Post from './ExactActivitiesPost';
import { UserRecentPost } from '../../States/AppState';
import * as Utility from '../../Utility';
import Pager from './Pager';
import { RouteComponent } from '../RouteComponent';
import { Actions } from '../../Actions/UserCenter';
import { connect } from 'react-redux';
import { RootState } from '../../Store';
import { Dispatch } from 'redux';
import { withRouter } from 'react-router-dom';

interface Props {
    match: any;
    changePage: () => void;
}

interface UserCenterMyFavoritesPostsState {
    userRecentPosts: UserRecentPost[];
    info: string;
    totalPage: number;
    currentPage: number;
    hasTotal: boolean;
    isLoading: boolean;
}

/**
 * 用户中心我收藏的帖子组件
 */
class Posts extends React.Component<Props, UserCenterMyFavoritesPostsState> {
    constructor(props) {
        super(props);
        this.state = {
            userRecentPosts: [],
            info: '加载中',
            totalPage: (Number.parseInt(this.props.match.params.page) || 1) + 1,
            currentPage: this.props.match.params.page,
            hasTotal: false,
            isLoading: true
        };
    }

    componentDidUpdate() {
        if (this.state.currentPage !== this.props.match.params.page) {
            this.setState({ currentPage: this.props.match.params.page });
            this.getInfo(this.props.match.params.page);
        }
    }

    componentDidMount() {
        this.props.changePage();
        this.getInfo(this.props.match.params.page);
    }

    getInfo = async (page = 1) => {
        try {
            window.scroll(0, 0);
            this.setState({ isLoading: true });
            const token = await Utility.getToken();
            const url = `/topic/me/favorite?from=${(page - 1) * 10}&size=11`;

            let myHeaders = new Headers();
            myHeaders.append('Authorization', token);

            let res = await Utility.cc98Fetch(url, {
                headers: myHeaders
            });
            if (res.status !== 200) {
                throw new Error(res.status.toString());
            }
            let data = await res.json();
            if (data.length === 0) {
                this.setState({
                    info: '没有主题',
                    isLoading: false
                });
                return;
            }

            let userRecentPosts: UserRecentPost[] = data,
                i = data.length,
                totalPage: number;

            if (i <= 10) {
                totalPage = Number.parseInt(this.props.match.params.page) || 1;
                this.setState({hasTotal: true});
            } else {
                i = 10;
                totalPage = Math.max((Number.parseInt(this.props.match.params.page) || 1) + 1, this.state.totalPage);
            }

            while(i--) {
                userRecentPosts[i].board = await Utility.getBoardName(userRecentPosts[i].boardId);
            }

            this.setState({
                userRecentPosts,
                totalPage,
                isLoading: false
            });
        } catch (e) {
            console.log('加载收藏失败');
        }
    }

    render() {
        if (this.state.isLoading) {
            return <div className="user-center-loading"><p className="fa fa-spinner fa-pulse fa-2x fa-fw"></p></div>
        }
        if (!this.state.userRecentPosts || this.state.userRecentPosts.length === 0) {
            return (<div className="user-posts" style={{ textAlign: 'center' }}>
                {this.state.info}
            </div>);
        }
        //state转换为JSX
        const userRecentPosts = this.state.userRecentPosts.map((item) => (<Post userRecentPost={item} />));
        //添加分隔线
        for (let i = 1; i < userRecentPosts.length; i += 2) {
            userRecentPosts.splice(i, 0, <hr />);
        }
        return (
            <div className="user-posts">
                {userRecentPosts}
                <Pager currentPage={parseInt(this.props.match.params.page) || 1} totalPage={this.state.totalPage} href="/usercenter/myfavorites/" hasTotal={this.state.hasTotal}/>
            </div>

        );
    }
}

function mapState(state: RootState) {
    return {};
}

function mapDispatch(dispatch: Dispatch<RootState>) {
    return {
        changePage: () => {
            dispatch(Actions.changeUserCenterPage('myfavoriteposts'));
        }
    };
}

export default withRouter(connect(mapState, mapDispatch)(Posts));
