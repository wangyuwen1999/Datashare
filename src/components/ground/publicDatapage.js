import { 
    List, Popover, Drawer, Divider, Row, 
    Col, Spin, Comment, message, Tag, Card,
    Table,
} from 'antd';

import {
    DownloadOutlined,
    MoreOutlined,
    DeleteFilled,
  } from '@ant-design/icons';

  
import React from 'react';
import './publicDatapage.css'

const { Meta } = Card;

const API = {
    'getPublicData': '/data/publiclist',
    'getDataInf':'/data/information', // getDataInf?serialNum={target}
    'getCategory':'/category/list',
    'buyData':'/data/buy',
    'getDownloadURL':'/downloadURL',
    'deleteDatabySerialNum':'/data/file',
    'deleteFile':'/delete',
}

let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;

let CurrentItemid = 0;
let Datanum = 0;
let ListUnuse = 0;

const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
      <p className="site-description-item-profile-p-label" style={{fontWeight:'bold', fontSize:'1.8em'}}>{title}:</p>
      <span style={{fontSize:'1.8em'}}>{content}</span>
    </div>
);

class publicDatapage extends React.Component{
    constructor(props){
        super(props);
        this.state={
            // public data 页参数
            indexlist: [],
            list: [],
            initialloading: true,
            nodata: true,

            visible: false,

            Category: [],
            CategoryNumList: [],

            // 指标list；
            listMetric:[],
        }
        console.log('this.props public data page')
        console.log(this.props)
    }

    componentDidMount(){
        Datanum = 0;
        ListUnuse = 0;
        this.getListindex();
        this.getCategory();
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

    getListindex = () => {
        let api = url + API["getPublicData"];
        console.log('getPublicData');
        this.myGet(api, this.publicDatasetcallback);
    }

    getCategory = ()=>{
        let api = url + API['getCategory'];
        this.myGet(api, (values)=>{
            console.log('getCategory');
            console.log(values);
            this.setState({
                CategoryNumList: values['numlist'],
                Category: values['namelist'],
            })
        })
    }

    getCategoryBynum(num){
        if (parseInt(num) === NaN){
            return num;
        }
        let rindex = 0;
        const {Category, CategoryNumList} = this.state;
        for (let i = 0; i < CategoryNumList.length; ++i){
            if (CategoryNumList[i] == num){
                rindex = i;
                break;
            }
        }
        console.log('Category');
        console.log(Category[rindex]);
        return Category[rindex];
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
                                isopen: false,
                                serialNum: index+1,
                            }}),
                            listlog: new Array(Datanum).fill(null).map((_, index)=>{return{
                                loading: true,
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
            category: this.getCategoryBynum(res['category']),
            categorynum: parseInt(res['category']),
            description: res['description'],
            ownerName: res['ownerName'],
            isopen: res['isOpen'],
            loading: false,
        };
        this.setState({list: newlist});
    }

    downloadDataset(index){
        let finalurl = url + API['buyData'];
        this.myPost(finalurl, {'serialNum':this.state.list[index].serialNum}, (response)=>{
            if (response['state']){
                let getDataurl = fileurl + API['getDownloadURL'];
                let values = {
                    address: downloadaddress,
                    target: parseInt(this.state.list[index].serialNum),
                    id:this.state.list[index].id, //数据集ID
                    ip: dowloadip,
                    type:1,    
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
        });
    }

    deletedataItem = (index)=>{
        let deleteurl = url + API['deleteDatabySerialNum'] + '?serialNum=' + this.state.list[index].serialNum;
        fetch(deleteurl, {
            method: 'DELETE', 
            mode: "cors",
            headers: new Headers({
              'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            if (response['state']){
                let md5 = this.state.list[index].id;
                let newlist = this.state.list;
                let newlistlog = this.state.listlog;
                newlist.splice(index, 1);
                newlistlog.splice(index,1);
                Datanum--;
                ListUnuse--;
                if (Datanum == 0){
                    this.setState({
                        list: newlist,
                        listlog: newlistlog,
                        nodata: true,
                    })
                }else{
                    this.setState({
                        list: newlist,
                        listlog: newlistlog,
                    });
                }

                let deleteurl = fileurl + API['deleteFile'];
                let value = {
                    md5: md5
                }
                console.log('delete file md5')
                console.log(value)
                fetch(deleteurl, {
                    method: 'DELETE', 
                    mode: "cors",
                    body: JSON.stringify(value),
                    headers: new Headers({
                    'Content-Type': 'application/json'
                    })
                }).then(res => res.json())
                .catch(error => console.error('Error:', error))
                .then(secondresponse => {
                    message.destroy();
                    message.success('删除成功'); 
                });
            }else{
                message.destroy()
                message.error('删除失败');
            }
        });
    }

    showDrawercallback = (index)=>{
        this.props.history.push({pathname: '/detail', state:{serialNum: this.state.list[index].serialNum, type:1}});
    }

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render(){
        const {initialloading, list, listlog, listMetric, nodata } = this.state;
        const MyCard = ({ listdata, index, downloadHandler, moreHandler, deleteHandler}) => (
            <Spin spinning={listdata.loading}>
                <Card
                    key={index}
                    hoverable
                    style={{ width: 300 }}
                    cover={
                    <img
                        onClick={moreHandler.bind(this, index)}
                        alt="example"
                        src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                    />
                    }
                    actions={[
                        <Popover content={<p>下载这个文件</p>} title='下载'>
                            <DownloadOutlined onClick={downloadHandler.bind(this, index)} style={{fontSize:'20px'}} key="download" />
                        </Popover>,
                        <Popover content={<p>查看更多详情</p>} title='更多'>
                            <MoreOutlined onClick={moreHandler.bind(this, index)} style={{fontSize:'20px'}} key="more" />
                        </Popover>,
                        <Popover content={<p>删除您在链上发布的信息</p>} title='删除'>
                            <DeleteFilled onClick={deleteHandler.bind(this, index)} style={{fontSize:'20px'}} key="delete"/>
                        </Popover>,
                    ]}
                >
                    <Meta
                    title={<div>
                            <nobr><span style={{ verticalAlign:'middle'}} className='Card-name'>{listdata.name}</span> </nobr>
                            <Tag style = {{marginLeft:'10px', verticalAlign:'middle'}} color="blue">Public</Tag> 
                            </div>}
                    description={listdata.ownerName}
                    />
                    <p style={{marginTop:'10px'}} className='cardDescription'>{listdata.description}</p>
                </Card>
            </Spin>
        );

        return(
            <div className='body'>
                <section className='headersection'>
                    <div className='publicDatapageheader'>
                        <div className='header_content'> 公开代码与数据集 </div>
                        <div className='header_content_empty'></div>
                    </div>
                </section>
                <section className='contentsection'>
                    <div className='list_content'>
                        <label className='label_title'>
                            技术领域
                        </label>
                        <List
                            grid={{
                                gutter: 16,
                                xs: 1,
                                sm: 2,
                                md: 4,
                                lg: 4,
                                xl: 6,
                                xxl: 4,
                            }}
                            loading = {initialloading}
                            dataSource={list}
                            renderItem={(item,index)=> (
                                <List.Item>
                                    <MyCard listdata={item} index={index} downloadHandler={this.downloadDataset} moreHandler={this.showDrawercallback} deleteHandler={this.deletedataItem}/>
                                </List.Item>
                            )}
                        />
                    </div>
                </section>
                {/* {MyDrawer} */}
            </div>
        );
    }
}


export default publicDatapage;