﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import { UserInfo } from '../../States/AppState';
import { RouteComponent } from '../RouteComponent';
import MyFollowingsUser from './MyFollowingsUser';
import Pager from './Pager';
import * as Utility from '../../Utility';
import { Actions } from '../../Actions/UserCenter';
import { connect } from 'react-redux';
import { RootState } from '../../Store';
import { Dispatch } from 'redux';
import { withRouter } from 'react-router-dom';

interface Props {
    match: any;
    changePage: () => void;
}

interface UserCenterMyFollowingsState {
    userFollowings: UserInfo[];
    totalPage: number;
    info: string;
    currentPage: number;
    isLoading: boolean;
}


//用户中心我的关注组件
class Following extends React.Component<Props, UserCenterMyFollowingsState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            userFollowings: [],
            totalPage: 2,
            info: '加载中',
            currentPage: this.props.match.params.page,
            isLoading: true
        };
    }

    componentDidUpdate() {
        if (this.state.currentPage !== this.props.match.params.page) {
            this.setState({ currentPage: this.props.match.params.page });
            this.getInfo(this.props.match.params.page);
        }
    }

    async componentDidMount() {
        this.props.changePage();
        this.getInfo(this.props.match.params.page);
        try {            
            const userid = Utility.getLocalStorage('userInfo').id;
            const url = `/user/followee/count?userid=${userid}`
            let res = await Utility.cc98Fetch(url);

            if (res.status !== 200) {
                throw new Error();
            }
            let data = await res.json();

            this.setState({
                totalPage: data % 10 === 0 ? data / 10 : Math.floor((data / 10)) + 1
            });
        } catch (e) {
            console.log('我的关注加载失败');
        }
    }

    getInfo = async (page = 1) => {
        try {
            window.scroll(0, 0);
            this.setState({ isLoading: true });
            const token = await Utility.getToken();
            let url = `/me/followee?from=${(page - 1) * 10}&size=10`;
            const headers = new Headers();
            headers.append('Authorization', token);
            let res = await Utility.cc98Fetch(url, {
                headers
            });
            if (res.status !== 200) {
                throw {};
            }
            let data: number[] = await res.json();

            //没有粉丝
            if (!data || !data.length) {
                this.setState({
                    info: '没有关注',
                    isLoading: false
                });
                return false;
            }

            
            const query = data.join('&id=');
            url = `/user?id=${query}`;
            res = await Utility.cc98Fetch(url, {
                headers
            });
            let userFollowings: UserInfo[] = await res.json();
            this.setState({
                userFollowings,
                isLoading: false
            });
        } catch (e) {

        }
    }

    render() {
        if (this.state.isLoading) {
            return <div className="user-center-loading"><p className="fa fa-spinner fa-pulse fa-2x fa-fw"></p></div>
        }
        if (this.state.userFollowings.length === 0) {
            return (
                <div className="user-center-myfollowings" style={{ textAlign: 'center' }}>
                    {this.state.info}
                </div>
                );
        }
        //state转换为JSX
        const userFollowings = this.state.userFollowings.map((item) => (<MyFollowingsUser userFanInfo={item} />));
        //添加分隔线
        for (let i = 1; i < userFollowings.length; i += 2) {
            userFollowings.splice(i, 0, <hr />);
        }
        const page =parseInt( this.props.match.params.page) || 1;

        return (<div className="user-center-myfollowings">
            <div className="user-center-myfollowings-exact">
                {userFollowings}
            </div>
            <Pager currentPage={page} totalPage={this.state.totalPage} href="/usercenter/myfollowings/" hasTotal={true}/>
        </div>);
    }
}

function mapState(state: RootState) {
    return {};
}

function mapDispatch(dispatch: Dispatch<RootState>) {
    return {
        changePage: () => {
            dispatch(Actions.changeUserCenterPage('myfollowings'));
        }
    };
}

export default withRouter(connect(mapState, mapDispatch)(Following));
