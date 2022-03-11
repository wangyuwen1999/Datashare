import { Button, Divider, Tag, List, message, Popover } from 'antd';
import {CaretDownOutlined, CaretUpOutlined, AliwangwangFilled, DashOutlined, ArrowDownOutlined} from '@ant-design/icons';
import React from 'react';
import './model.css'

const API = {
    'getPresonModel': '/model/ownerlist',
    'getModelInfo': '/model/information',
    'getDataInfo': '/data/information',
    'getModelFinishedList': '/model/finishResult',
    'getDownloadURL': '/downloadURL',
}

let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;

let Datanum = 0;
let ListUnuse = 0;

let resultSerialNumlist = [];
let resultIdlist = [];

class model extends React.Component{
    constructor(params){
        super(params);
        this.state={
            unfoldlist: [],
            nodata: true,
            initialloading:true,
            indexlist: [],
            list: [],
            datalist: [],
        }
    }

    componentDidMount(){
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
        let api = url + API["getPresonModel"] + '?address=' + downloadaddress;
        // let api = url + API['getPresonModel'] 
        console.log('getPresonModel');
        this.myGet(api, this.ModelCallback);
    }

    ModelCallback = (value) => {
        let tindexlist = value['list'];
        console.log('Model tindexlist');
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
                                time: '0',
                                description: 'hello, world',
                                ownerAddress: '124565',
                                category: 'gg',
                                categorynum: 0,
                                serialNum: index+1,
                                dataSets: [],
                            }}),
                            unfoldlist: new Array(Datanum).fill(null).map((_)=>{
                                return false;
                            }),
                            datalist: new Array(Datanum).fill(null).map((_)=>{
                                return [];
                            }),
                        });
        this.getModel(this.getModelCallback, 1, Datanum);
    };

    
    getModel = (callback, begin, end) => {
        let tindexlist;

        tindexlist = this.state.indexlist
        for (let i = begin; i <= end; ++i){
            console.log('get ' + i);
            let finalapi = url+API["getModelInfo"]+"?serialNum=" + tindexlist[i-1];
            console.log('really get ' + tindexlist[i-1]);
            fetch(finalapi, {
                method: "GET",
                mode: "cors",
            }).then(response => response.json()).then((value) => {
                callback(value);
            });
        }
    }

    getModelCallback = (res)=>{
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
            time: res['timestamp'],
            // category: this.getCategoryBynum(res['category']),
            categorynum: parseInt(res['category']),
            description: res['description'],
            ownerName: res['ownerName'],
            dataSets: res['dataSets'],
            loading: false,
        };
        this.setState({list: newlist});
    }
    
    hasResult(list, target){
        console.log('finished list: ' );
        console.log(list);
        console.log('searching target: ');
        console.log(target);
        for (let i = 0; i < list.length; ++i){
            if (target == parseInt(list[i])){
                return true;
            }
        }
        return false;
    }

    modelTodata = (index) => {
        const {list, datalist} = this.state;
        let tindexlist = list[index].dataSets;
        let length = tindexlist.length;
        let newDataList = datalist;
        newDataList[index] = new Array(length).fill(null).map((_)=>{
            return {
                loading: true,
                serialNum: -1,
                ownerAddress: 'fasdf',
                ownerName: 'sysu',
                name: 'hello',
                description: 'world',
                hasResult: false
            }
        })
        this.setState({
            datalist: newDataList
        })
        let api = url + API['getModelFinishedList'] + '?serialNum=' + list[index].serialNum;
        this.myGet(api, (value)=>{
            let datalistFinishList = value['datalist'];
            resultSerialNumlist[index] = value['resultlist'];
            resultIdlist[index] = value['idlist'];
            console.log('resultSerialNumlist');
            console.log(resultSerialNumlist);
            console.log('resultIdlist');
            console.log(resultIdlist);
            for(let i = 0; i < length; ++i){
                console.log('get data '+ i);
                let finalapi = url+API["getDataInfo"]+"?serialNum=" + tindexlist[i];
                console.log('really get ' + tindexlist[i]);
                fetch(finalapi, {
                    method: "GET",
                    mode: "cors",
                }).then(response => response.json()).then((value) => {
                    let newDataList = this.state.datalist;
                    console.log('Modeltodata ' + i)
                    newDataList[index][i] = {
                        loading: false,
                        serialNum: parseInt(value['serialNum']),
                        ownerAddress: value['ownerAddress'],
                        ownerName: value['ownerName'],
                        name: value['name'],
                        description: value['description'],
                        hasResult: this.hasResult(datalistFinishList, tindexlist[i])
                    }
                    this.setState({datalist: newDataList});
                });
            }
        })

    }

    onItemClick(index){
        console.log('onItemClick: '+ index);
        let tunfoldlist = this.state.unfoldlist;
        tunfoldlist[index] = !tunfoldlist[index];
        this.setState({
            unfoldlist: tunfoldlist
        })
        console.log(tunfoldlist[index])
        if (tunfoldlist[index] === true && this.state.datalist[index].length === 0){
            console.log('get data from model')
            this.modelTodata(index)
        }
        console.log('onItemClick: end'+ index);
    }

    // myPost 向dataurl发送post请求，发送json格式数据values, 并使用Successcallback函数处理response
    myPost = (dataurl, values, Successcallback) => {
        fetch(dataurl, {
            method: 'POST', // or 'PUT'
            mode: "cors",
            body: JSON.stringify(values), // data can be `string` or {object}!
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

    downloadHandler(Itemindex, index){
        let getDataurl = fileurl + API['getDownloadURL'];
        let values = {
            address: downloadaddress,
            target: resultSerialNumlist[Itemindex][index],
            id:resultIdlist[Itemindex][index], //数据集ID
            ip: dowloadip,
            type:3,     
        };
        // console.log('vlues:');
        console.log(values);
        this.myPost(getDataurl, values, (secondresponse)=>{
            console.log(secondresponse['url'])
            if (secondresponse['url'] == 'no such file' || secondresponse['url'] == ''){
                message.warning('找不到数据源');
                return;
            }
            window.open(secondresponse['url']);
        })
    }

    render(){
        const {unfoldlist, list, datalist, initialloading} = this.state;

        const ModelRelateDataItem = ({Dataname, Datadescription, hasResult, Itemindex, index})=>{
            return (
            <div className='DataItem'>
                <div className='DataItem-name'>
                    <div>
                        {Dataname}
                        {hasResult ? <Tag color='blue' style={{marginLeft:'20px'}}>HasResult</Tag> : <Tag color='red' style={{marginLeft:'20px'}}>NoResult</Tag>}
                    </div>
                    <Popover content={<p>下载模型在此隐私数据下的结果</p>} >
                        <Button shape='circle' disabled={!hasResult} icon={<ArrowDownOutlined />} onClick={this.downloadHandler.bind(this, Itemindex, index)}></Button>
                    </Popover>
                    
                </div>
                <div className='DataItem-description'>{Datadescription}</div>
                <div className='DataItem-bottomList'></div>
            </div>);
        }

        const ModelItem = ({isunfold, Modelname, Modelowner, Modeldescription,  relatedatalist, unfoldBottonClickHandler, Itemindex, time}) => {
            return(
                <div className='ModelItem'>
                    <div className='ModelItem-Header'>
                        <p className='ModelItem-Name'>{Modelname}</p>
                        <span className='ModelItem-Time'> {new Date(parseInt(time)).toLocaleString()} </span>
                    </div>
                    <p className='ModelItem-Owner'>{Modelowner}</p>
                    <p className='ModelItem-Description'>{Modeldescription}</p>
                    <div className='ModelItem-BottomList'>
                        <Popover content={<p>显示相关数据集列表</p>} >
                            <Button type="primary" icon={isunfold ? <CaretDownOutlined /> : <CaretUpOutlined />} onClick={unfoldBottonClickHandler.bind(this, Itemindex)}>相关数据</Button>
                        </Popover>
                    </div>
                    {
                        isunfold ? 
                        <div className='relateBox relateBox-shadow'>
                            <div className='relateBox-content'>
                                <div className='relateBox-content-Header'>
                                    <div>相关的隐私数据</div>
                                    <Popover content={<p>结束这个计算任务</p>} >
                                        <Button type='primary'>完成</Button>
                                    </Popover>
                                </div>
                                <Divider className='myDividerstyle'></Divider>
                                <div className='relateBox-content-content'>
                                    <List
                                        grid={{
                                            gutter: 16,
                                            column: 1
                                        }}
                                        dataSource={relatedatalist}
                                        renderItem={(item,index)=> (
                                            <List.Item>
                                                <ModelRelateDataItem Dataname={item.name} Datadescription={item.description} hasResult={item.hasResult} Itemindex={Itemindex} index={index}/>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>: null
                    }
                </div>
            )
        }
        return(
            <div className='subpage'>
                <div className='ModelHeader'>我的模型</div>
                <Divider className='myDividerstyle'></Divider>
                <List
                    grid={{
                        gutter: 16,
                        column: 1
                    }}
                    loading = {initialloading}
                    dataSource={list}
                    renderItem={(item,index)=> (
                        <List.Item>
                            <ModelItem  unfoldBottonClickHandler={this.onItemClick} isunfold={unfoldlist[index]} relatedatalist={datalist[index]} Modelname={item.name} Modelowner={item.ownerName} Modeldescription={item.description}  Itemindex={index} time={item.time}/>
                            {index === list.length-1 ? null :<Divider></Divider> }
                        </List.Item>
                    )}
                />
            </div>
        )
    }
}

export default model;