import React from 'react';
import './publicpage.css'

import { Button, Divider, Tag, List, Popover} from 'antd';
import {CaretDownOutlined, CaretUpOutlined, AliwangwangFilled, DashOutlined, ArrowUpOutlined} from '@ant-design/icons';
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";



let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;
  
const API = {
    'getPersonPublicdata': '/data/ownerPublic',
    'getDataInf': '/data/information',
}

let Datanum = 0;
let ListUnuse = 0;
let pageState = 0;

class publicpage extends React.Component{

    constructor(params){
        console.log('publicpage constructor');
        super(params);
        this.state={
            nodata: true,
            initialloading:true,
            indexlist: [],
            list: [],
        }
        console.log('this.prop publicpage')
        console.log(this.props)
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        console.log('publicpage componentDidUpdate')
        console.log(this.props.location.state)
        if (this.props.location.state !== undefined){
            // console.log(this.props.location.state.reloadOpen)
            if (pageState !== this.props.location.state.pageState && this.props.location.state.reloadOpen === true){
                pageState = this.props.location.state.pageState;
                this.setState({
                    nodata: true,
                    initialloading:true,
                })
                Datanum = 0;
                ListUnuse = 0;
                this.getListindex();
            }
        }
    }  

    componentDidMount(){
        console.log('publicpage componentDidMount')
        Datanum = 0;
        ListUnuse = 0;
        this.getListindex();
    }

    myGet = (dataurl, Successcallback)=>{
        fetch(dataurl, {
            method: 'Get', // or 'PUT'
            mode: "cors",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            Successcallback(response);
        });
    }

    getListindex = () => {
        let api = url + API["getPersonPublicdata"] + '?address=' + downloadaddress;
        console.log('getPersonPublicdata');
        this.myGet(api, this.publicDatasetcallback);
    }

    publicDatasetcallback = (value) => {
        let tindexlist = value['list'];
        console.log('public tindexlist');
        console.log(tindexlist);
        if (Datanum == tindexlist.length){
            this.setState({
                initialloading:false,
            });
            return;
        }
        Datanum = tindexlist.length;
        let nodataState = Datanum == 0;
        this.setState ({    
                            nodata: nodataState,
                            initialloading:false, 
                            indexlist: tindexlist,
                            list: new Array(Datanum).fill(null).map((_,index)=>{return {
                                loading: true, 
                                id:5,
                                ownerName: 'good',
                                name: 'hello',
                                description: 'hello, world',
                                ownerAddress: '124565',
                                category: 'gg',
                                categorynum: 0,
                                time: '0',
                                isopen: false,
                                serialNum: index+1,
                            }}),
                        });
        this.getData(this.getDataCallback, 1, Datanum);
    };

    getData = (callback, begin, end) => {
        let tlist, tindexlist;
        tlist = this.state.list;
        tindexlist = this.state.indexlist
        for (let i = begin; i <= end; ++i){
            console.log('get ' + i);
            let finalapi = url+API["getDataInf"]+"?serialNum=" + tindexlist[i-1];
            console.log('really get ' + tindexlist[i-1]);
            fetch(finalapi, {
                method: "GET",
                mode: "cors",
            }).then(response => response.json()).then((value) => {
                callback(value);
            });
        }
    }

    getDataCallback = (res)=>{
        let newlist, index;
        newlist = this.state.list; 
        index = ListUnuse; 
        ListUnuse++;
        newlist[index] = {
            serialNum: parseInt(res['serialNum']),
            ownerAddress: res['ownerAddress'],
            id: res['id'],
            name: res['name'],
            point: res['point'],
            // category: this.getCategoryBynum(res['category']),
            categorynum: parseInt(res['category']),
            description: res['description'],
            ownerName: res['ownerName'],
            time: res['timestamp'],
            isopen: res['isOpen'],
            loading: false,
        };
        this.setState({list: newlist});
    }

    moreDetailClick = (Itemindex)=>{
        this.props.history.push({pathname: '/detail', state:{serialNum: this.state.list[Itemindex].serialNum, type:1}});
    }

    render(){

        console.log('persondetail publicpage render')

        const {list, initialloading, } = this.state;

        const DataItem = ({ Dataname, Dataowner, Datadescription, points, Itemindex, time}) => (
                <div className='DataItem'>
                    <div className='DataItem-Header'>
                        <p className='DataItem-Name'>{Dataname}</p>
                        <span className='DataItem-Time'> {new Date(parseInt(time)).toLocaleString()} </span>
                    </div>
                    
                    <p className='DataItem-Owner'>{Dataowner}</p>
                    <p className='DataItem-Description'>{Datadescription}</p>
                    <div className='DataItem-BottomList'>
                        <Popover content={<p>下载此隐私数据的积分值</p>} >
                            <span className='DataItem-BottomList-Item-private'>{points}  <AliwangwangFilled className='pointsicon'/></span>
                        </Popover>
                        <Popover content={<p>显示数据集详情</p>} >
                            <Button className='DataItem-BottomList-Item-private leftMargin' type="text" onClick={this.moreDetailClick.bind(this, Itemindex)}><DashOutlined className='pointsicon'/></Button>
                        </Popover>
                        
                    </div>
                </div>
        );
        return(
            <div>
                <div className='DataContent'>
                    <List
                        loading = {initialloading}
                        dataSource={list}
                        renderItem={(item,index)=> (
                            <List.Item>
                                <DataItem Dataname={item.name} Dataowner={item.ownerName} Datadescription={item.description}  Itemindex={index}  points={item.point} time={item.time}/>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        )
    }
}

export default publicpage;