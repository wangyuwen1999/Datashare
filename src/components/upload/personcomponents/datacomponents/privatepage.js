import React from 'react';
import './privatepage.css'

import { Button, Divider, Tag, List, message, Modal, Upload, Popover,  } from 'antd';
import {CaretDownOutlined, CaretUpOutlined, AliwangwangFilled, DashOutlined, ArrowUpOutlined, ArrowDownOutlined, InboxOutlined} from '@ant-design/icons';

const { Dragger } = Upload;

const API = {
    'getPersonPrivatedata': '/data/ownerPrivate',
    'getDataInf': '/data/information',
    'getdataTomodel': '/data/tomodel',
    'getModel': '/model/information',
    'getDownloadURL': '/downloadURL',
    'uploadFile': '/file',
    'uploadResult': '/result/upload',
    'getModelFinishList': '/model/finishResult',
}

let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;

let Datanum = 0;
let ListUnuse = 0;
let Data_index = 0;
let Model_index = 0;
let pageState = 0;

class privatepage extends React.Component{
    constructor(params){
        super(params);
        this.state={
            unfoldlist: [],
            nodata: true,
            initialloading:true,
            indexlist: [],
            list: [],
            modellist: [],
            visible: false,
            uploading: false,
            fileList: [], 
        }
    }

    componentDidUpdate(){
        console.log('privatepage componentDidUpdate')
        console.log(this.props.location.state)
        if (this.props.location.state !== undefined){
            // console.log(this.props.location.state.reloadOpen)
            if (pageState !== this.props.location.state.pageState && this.props.location.state.reloadOpen === false){
                pageState = this.props.location.state.pageState;
                console.log('reload privatepage');
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

    myIndexGet = (dataurl, Successcallback, index)=>{
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
            Successcallback(response, index);
        });
    }

    getListindex = () => {
        let api = url + API["getPersonPrivatedata"] + '?address='+downloadaddress;
        console.log('getPersonPrivatedata');
        this.myGet(api, this.privateDatasetcallback);
    }

    privateDatasetcallback = (value) => {
        let tindexlist = value['list'];
        console.log('private tindexlist');
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
                                time:'0',
                                isopen: false,
                                serialNum: index+1,
                            }}),
                            unfoldlist: new Array(Datanum).fill(null).map((_)=>{
                                return false;
                            }),
                            modellist: new Array(Datanum).fill(null).map((_)=>{
                                return [];
                            })
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
            isopen: res['isOpen'],
            time: res['timestamp'],
            loading: false,
        };
        this.setState({list: newlist});
    }

    getDatatoModel = (serialNum, index)=>{
        let api = url + API["getdataTomodel"] + '?serialNum=' + serialNum;
        console.log('getDataToModel at serialNum: ' + serialNum)
        this.myIndexGet(api, this.dataTomodelcallback, index)
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

    dataTomodelcallback = (value, index) => {
        let tindexlist = value['list'];
        console.log('model tindexlist');
        console.log(tindexlist);
        let length = tindexlist.length;
        let newModelList = this.state.modellist;
        newModelList[index] = new Array(length).fill(null).map((_)=>{
            return {
                loading: true,
                serialNum: -1,
                ownerAddress: 'fasdf',
                ownerName: 'sysu',
                name: 'hello',
                description: 'world',
                id: 0,
                isFinished: false,
                hasResult: false,
            }
        })
        this.setState({
            modellist: newModelList
        })
        for(let i = 0; i < length; ++i){
            console.log('get model '+ i);
            let finalapi = url+API["getModel"]+"?serialNum=" + tindexlist[i];
            console.log('really get ' + tindexlist[i]);
            fetch(finalapi, {
                method: "GET",
                mode: "cors",
            }).then(response => response.json()).then((value) => {
                let newModelList = this.state.modellist;
                console.log('dataTomodelcallback ' + i)
                newModelList[index][i] = {
                    loading: false,
                    serialNum: parseInt(value['serialNum']),
                    ownerAddress: value['ownerAddress'],
                    ownerName: value['ownerName'],
                    name: value['name'],
                    id: value['id'],
                    description: value['description'],
                    isFinished: value['isFinished'],
                }
                let api = url + API['getModelFinishList'] + '?serialNum=' + parseInt(value['serialNum']);
                this.myGet(api, (value)=>{
                    newModelList[index][i].hasResult = this.hasResult(value['datalist'], this.state.list[index].serialNum)
                    this.setState({modellist: newModelList});
                })
            });
        }

    }

    onItemClick(index){
        console.log('onItemClick: '+ index);
        let tunfoldlist = this.state.unfoldlist;
        tunfoldlist[index] = !tunfoldlist[index];
        this.setState({
            unfoldlist: tunfoldlist
        })
        console.log(tunfoldlist[index])
        console.log(this.state.modellist[index].length)
        if (tunfoldlist[index] === true && this.state.modellist[index].length === 0){
            console.log('get model from data')
            this.getDatatoModel(this.state.list[index].serialNum, index)
        }
        console.log('onItemClick: end'+ index);
    }

    moreDetailClick = (Itemindex)=>{
        this.props.history.push({pathname: '/detail', state:{serialNum: this.state.list[Itemindex].serialNum, type:2}});
    }

    uploadHandler(Itemindex, index){
        Data_index = Itemindex;
        Model_index = index;
        this.setState({
            visible: true
        })
    }

    handleFileUpload = ()=>{

        if (this.state.fileList.length === 0){
            message.warning('未选择文件，请选择文件')
            return;
        }

        const formData = new FormData();
        formData.append('file', this.state.fileList[0]);
        formData.append('type', 3);
        console.log(this.state.fileList[0]);
        this.setState({
            uploading: true,
        })
        fetch(fileurl+API['uploadFile'], {
            method:'POST',
            mode: "cors",
            body: formData,
        }).then(res => res.json())
        .catch(error => {
            console.error('Error:', error);
            this.setState({
                visible: false,
                uploading: false,
            });
            message.error("上传文件失败")
        })
        .then(response => {
            console.log('Success:', response);
            if (response['status'] == 'OK'){
                if (response['message'] != 'REPEATED'){
                    this.handleMessageUpload(Data_index, Model_index, response['md5'], this.state.fileList[0].name);
                }else{
                    message.warning('文件重复');
                    this.setState({
                        uploading: false
                    })
                }
            }else{
                message.error('上传文件失败');
                this.setState({
                    uploading: false
                })
            }
        });
    }

    handleMessageUpload(Data_index, Model_index, id, filename){
        let api = url + API['uploadResult'];
        let value = {
            id: id,
            name: filename,
            parentData: this.state.list[Data_index].serialNum,
            parentModel: this.state.modellist[Data_index][Model_index].serialNum,
        }
        console.log('uploadresult value ');
        console.log(value);
        this.myPost(api, value, (values)=>{
            message.success('上传成功');
            let newmodellist = this.state.modellist;
            newmodellist[Data_index][Model_index].hasResult = true;
            this.setState({ 
                uploading: false,
                visible: false,
                fileList: [],
                modellist: newmodellist,
            });
        })
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

    downloadHander(index, Itemindex){
        let getDataurl = fileurl + API['getDownloadURL'];
        let values = {
            address: downloadaddress,
            target: parseInt(this.state.modellist[Itemindex][index].serialNum),
            id:this.state.modellist[Itemindex][index].id, //数据集ID
            ip: dowloadip,
            type:2,     
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

    handleCancel = ()=>{
        this.setState({
            visible: false
        });
    }


    render(){

        const DataRelateModelItem = ({Modelname, Modeldescription, isfinished, hasResult, uploadHandler, downloadHander, DataSerialNum, ModelSerialNum, index, Itemindex})=>{
            return (
            <div className='ModelItem'>
                <div className='ModelItem-name'>
                    <div>
                        {Modelname}
                        {isfinished ? <Tag color='blue' style={{marginLeft:'20px'}}>Finished</Tag> : <Tag color='red' style={{marginLeft:'20px'}}>Unfinished</Tag>}
                    </div>
                    <div>
                        <Popover content={<p>下载模型</p>} >
                            <Button shape='circle' icon={<ArrowDownOutlined />} style={{marginRight: '10px'}} onClick={downloadHander.bind(this, index, Itemindex)}></Button>
                        </Popover>
                        <Popover content={<p>上传结果</p>} >
                            <Button shape='circle' disabled={hasResult} icon={<ArrowUpOutlined />} onClick={uploadHandler.bind(this, Itemindex, index)}></Button>
                        </Popover>
                    </div>
                </div>
                <div className='ModelItem-description'>{Modeldescription}</div>
                <div className='ModelItem-bottomList'></div>
            </div>);
        }
        const DataItem =({isunfold, Dataname, Dataowner, Datadescription, points, relatedatalist, unfoldBottonClickHandler, Itemindex, moreDetailClick, time}) => {
            return(
                <div className='DataItem'>
                    <div className='DataItem-Header'>
                        <p className='DataItem-Name'>{Dataname}</p>
                        <span className='DataItem-Time'> {new Date(parseInt(time)).toLocaleString()} </span>
                    </div>
                    
                    <p className='DataItem-Owner'>{Dataowner}</p>
                    <p className='DataItem-Description'>{Datadescription}</p>
                    <div className='DataItem-BottomList'>
                        <Popover content={<p>显示相关模型列表</p>} >
                            <Button type="primary" icon={isunfold ? <CaretDownOutlined /> : <CaretUpOutlined />} onClick={unfoldBottonClickHandler.bind(this, Itemindex)}>相关数据</Button>
                        </Popover>
                        <Popover content={<p>下载此隐私数据的积分值</p>} >
                            <span className='DataItem-BottomList-Item'>{points}  <AliwangwangFilled className='pointsicon'/></span>
                        </Popover>
                        <Popover content={<p>显示数据集详情</p>} >
                            <Button className='DataItem-BottomList-Item' onClick={moreDetailClick.bind(this, Itemindex)} type="text"><DashOutlined className='pointsicon'/></Button>
                        </Popover>
                    </div>
                    {
                        isunfold ? 
                        <div className='relateBox relateBox-shadow'>
                            <div className='relateBox-content'>
                                <div className='relateBox-content-Header'>
                                    相关的模型
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
                                                <DataRelateModelItem 
                                                    Modelname={item.name} Modeldescription={item.description} 
                                                    isfinished={item.isFinished} hasResult = {item.hasResult} 
                                                    uploadHandler={this.uploadHandler} downloadHander={this.downloadHander} 
                                                    index={index} Itemindex={Itemindex}/>
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
        const {unfoldlist, list, modellist, initialloading, visible, uploading, fileList} = this.state;

        const props = {
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                if (fileList.length > 0){
                    message.warning('只能上传一个文件');
                    return false;
                }
                this.setState(state => ({
                    fileList: [file],
                }));
                return false;
            },
            fileList: fileList,
        };

        return(
            <div>
                <div className='DataContent'>
                    <List
                        grid={{
                            gutter: 16,
                            column: 1
                        }}
                        loading = {initialloading}
                        dataSource={list}
                        renderItem={(item,index)=> (
                            <List.Item>
                                <DataItem  unfoldBottonClickHandler={this.onItemClick} time={item.time} isunfold={unfoldlist[index]} relatedatalist={modellist[index]} Dataname={item.name} Dataowner={item.ownerName} Datadescription={item.description}  Itemindex={index}  points={item.point} moreDetailClick={this.moreDetailClick} />
                                {index === list.length-1 ? null :<Divider></Divider> }
                            </List.Item>
                        )}
                    />
                </div>
                <Modal
                    visible={visible}
                    title={<span>上传结果</span>}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                        返回
                        </Button>,
                        <Button key="submit" type="primary" loading={uploading} onClick={this.handleFileUpload}>
                        提交
                        </Button>,
                    ]}
                    >
                        <Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">点击此处以选择文件或拖拽文件至此处完成文件上传</p>
                        </Dragger>
                </Modal> 
            </div>
        )
    }
}

export default privatepage;