import React from 'react';
import './detail.css'

import { 
    List, Popover, Drawer, Divider, Row, 
    Col, Spin, Comment, message, Tag, Card, Button,
    Modal, Form, Input, Upload,Select, Space,Empty, Table,
    Statistic,
    Skeleton,
    ConfigProvider,
} from 'antd';

import InfiniteScroll from 'react-infinite-scroll-component';

import {
    UploadOutlined,
    MoreOutlined,
    DeleteFilled,
    CheckCircleTwoTone,
    InboxOutlined,
} from '@ant-design/icons';


const { Meta } = Card;
const {Dragger} = Upload;
const {Option} = Select;

let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;

const API = {
    'getPrivateData': '/getPrivateData',
    'deleteDatabySerialNum':'/deleteDatabySerialNum',
    'getDataInf':'/data/information', // getDataInf?serialNum={target}
    'getCategory':'/category/list',
    'getMetric':'/assess/data',
    'getModelbydata': '/data/tomodel', // /model/getDataToModel?serialNum={target}
    // Model相关API; 
    'getModel': '/model/information',
    "Participant":'/log/model',
    // getLog:
    'getLog': "/log/data?serialNum="
}

//     'Identity':'/getidentity',
//     'buyModel':'/model/buyModel',
//     'getmodellistindex':'/getvalidmodel',

// 类别；
let Category= [];
let CategoryNumList= [];

let Modelnum = 0;
let ModelUnuse = 0;
let CurrentItemid = 0;

let detailSerialNum;
let type;

const MyModelCard = ({title, description, left_node_title, left_node_value, right_node_title, right_node_value})=>{
    <div className='MyModelCard'>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className='bottomList'>
            <div className='left_node'>
                <p>{left_node_title}</p>
                <p>{left_node_value}</p>
            </div>
            <div className='right_node'>
                <p>{right_node_title}</p>
                <p>{right_node_value}</p>
            </div>
        </div>
    </div>
}


class detail extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            data: {},
            log: [],

            initialLoading: true,
            initiallogloading: false,

            // 指标；
            dataMetric: [],

            // model 页参数
            modelindexlist:[],
            modellist: [],
            modellistParticipant: [],
            modellistIdentity: [],
            nomodel: true,
            initialloadingModel: true,
        };
        console.log('detail props.location')
        console.log(this.props.location);
        detailSerialNum = this.props.location.state.serialNum;
        type = this.props.location.state.type;
    }

    componentDidMount(){
        Modelnum = 0;
        ModelUnuse = 0;
        CurrentItemid = 0;
        this.getCategory();
        this.getLog();
        if (type == 2){
            this.getModelListindex();
        }
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

    getData = (callback, serialNum) => {
        let finalapi = url+API["getDataInf"]+"?serialNum="+ serialNum;
        console.log('finalapi:' + finalapi);
        fetch(finalapi, {
            method: "GET",
            mode: "cors",
        }).then(response => response.json()).then((value) => {
            callback(value);
        });
    }

    getCategory = ()=>{
        let api = url + API['getCategory'];
        console.log('getCategory ' + api)
        this.myGet(api, (values)=>{
            console.log('getCategory');
            console.log(values);
            CategoryNumList= values['numlist'];
            Category= values['namelist'];
            this.getData((values)=>{
                console.log('datainfo')
                console.log(values)
                let newlist = {
                    ownerName: values['ownerName'],
                    name: values['name'],
                    description: values['description'],
                    ownerAddress: values['ownerAddress'],
                    category: this.getCategoryBynum(values['category']),
                    categorynum: values['category'],
                    isopen: values['isOpen'],
                    serialNum: parseInt(values['serialNum']),
                    id: values['id'],
                    loading: false,
                };
                this.getMetric(parseInt(values['serialNum']));
                this.setState({data: newlist});
            }, detailSerialNum);
        })
    }

    getLog = ()=>{
        let api = url + API['getLog'] + detailSerialNum;
        this.myGet(api, (value)=>{
            console.log('getLogs');
            console.log(value);
            this.setState({
                log: value['Logs']
            })
        })
    }
    // 获取指标；
    getMetric = (serialNum)=>{
        let api = url + API['getMetric'] + '?serialNum=' + serialNum;
        this.myGet(api, (response)=>{
            console.log(response);
            this.setState({
                dataMetric: response['list'],
            });
        })
    }

    getCategoryBynum(num){
        if (parseInt(num) === NaN){
            return num;
        }
        let rindex = 0;
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

    getModelListindex() {
        let api = url + API["getModelbydata"] + '?serialNum=' + detailSerialNum;
        this.myGet(api, this.Modelcallback);
    }

    Modelcallback = (value)=>{
        let tindexlist = value['list'];
        console.log('model tindexlist');
        console.log(tindexlist);
        Modelnum = tindexlist.length;
        let nomodelState = Modelnum==0;
        this.setState ({    
            nomodel: nomodelState, 
            initialloadingModel:false, 
            modelindexlist: tindexlist,
            modellist: new Array(Modelnum).fill(null).map((_,index)=>{return {
                loading: true, 
                id:5,
                ownerName: 'good',
                name: 'hello',
                description: 'hello, world',
                ownerAddress: '124565',
                category: 'gg',
                categorynum: 0,
                isfinished: false,
                serialNum: index+1,
            }}),
            modellistParticipant: new Array(Modelnum).fill(null).map((_, index)=>{return{
                loading: true,
            }}),
            modellistIdentity: new Array(Modelnum).fill(null).map((_, index)=>{return{
                loading: true,
                log: [],
                num: 0,
            }}),
        });
        this.getModel(this.getModelCallback, 1, Modelnum);
    }

    getModel = (callback, begin, end) => {
        for (var i = begin; i <= end; ++i){
            console.log('get model ' + i);
            if (typeof(this.state.modellist[i-1]) == undefined || this.state.modellist[i-1].loading == true ){
                console.log('really get model ' + i);
                let finalapi = url+API["getModel"]+"?serialNum=" +this.state.modelindexlist[i-1];
                console.log(finalapi)
                fetch(finalapi, {
                    method: "GET",
                    mode: "cors",
                }).then(response => response.json()).then((value) => {
                    callback(value);
                });
            }
        }
    }

    getModelCallback = (values)=>{
        let newlist = this.state.modellist;
        let index = ModelUnuse;
        ModelUnuse++;
        newlist[index] = {
            ownerName: values['ownerName'],
            name: values['name'],
            description: values['description'],
            ownerAddress: values['ownerAddress'],
            category: this.getCategoryBynum(values['category']),
            categorynum: values['category'],
            isfinished: values['isFinished'],
            serialNum: parseInt(values['serialNum']),
            id: values['id'],
            loading: false,
        };
        this.getParticipant(parseInt(values['serialNum']), index);
        this.setState({modellist: newlist});
    }

    getParticipant = (serialNum, index)=>{
        let finalapi = url+API["Participant"]+'?serialNum='+ serialNum;
        fetch(finalapi, {
            method: 'Get', // or 'PUT'
            mode: "cors",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            console.log('getparticipant ');
            console.log(response['participant'].length);
            let data = this.state.modellistParticipant;
            data[index] = {
                loading: false,
                participants: response['participant'],
                num: response['participant'].length,
            }
        　　this.setState({
                modellistParticipant: data
        　　});
            // this.getIdentity(response['participant'], index);
        });
    }

    // getIdentity  = (add_arr, index)=>{
    //     let api = url+API["Identity"]+'?address=';
    //     let data = this.state.modellistIdentity;
    //     let endtime = 0;
    //     if (add_arr.length == 0){
    //         data[index].loading = false;
    //         data[index].num = endtime;
    //         this.setState({modellistIdentity: data});
    //     }
    //     for (let i = 0; i < add_arr.length; ++i){
    //         let finalapi = api + add_arr[i];
    //         console.log('finalapi ' + finalapi);
    //         this.myGet(finalapi,
    //             (value) => {
    //                 data[index].log = data[index].log.concat(value);
    //                 endtime++;
    //                 if (endtime == add_arr.length){
    //                     data[index].loading = false;
    //                     data[index].num = endtime;
    //                     this.setState({modellistIdentity: data});
    //                 }   
    //             }
    //         );
    //     }
    // }

    showModel = (index)=>{
        CurrentItemid = index;
    }

    myEmpty = ()=>(
        <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
            height: 200,
            }}
            description={
                <span style={{fontSize:'20px', fontWeight:'bold', color:'black'}}>
                    No record ...
                </span>
                }
        />
    )

    render(){
        const {data, dataMetric, modellist, initialloadingModel,modellistParticipant, log, initiallogloading } = this.state;
        const columns = [
            {
              title: '模型',
              dataIndex: 'name',
              align: "center",
              width: 150,
              key: 'name',
            },
            {
              title: '标准',
              dataIndex: 'metric',
              align: "center",
              width: 150,
              key: 'metric',
            },
            {
              title: '值',
              dataIndex: 'value',
              align: "center",
              key: 'value',
            }
        ];

        return(
            <div className='body'>
                <section className='headersection'>
                    <div className='detailHeader'>
                        <div className='header_content_left'> 
                             <Row>
                                <p className='pageTitle'> {data.name} </p>
                                <p className='pageDescription'>{data.description}</p>
                             </Row>
                             <Row>
                                <label style={{width:'100%'}} className='label_title'>
                                    拥有者地址
                                </label>
                                <p style={{fontSize:'20px', fontWeight:'bold'}}>{data.ownerAddress}</p>
                             </Row>
                             <Row gutter={10}>
                                <label style={{width:'100%'}} className='label_title'>
                                    模型详情
                                </label>
                                <Col  >
                                    <Card hoverable style={{borderRadius:'5px'}}>
                                        <Statistic title="链上序号" value={data.serialNum} />
                                    </Card>
                                </Col>
                                <Col >
                                    <Card hoverable style={{borderRadius:'5px'}}>
                                        <Statistic title="拥有者" value={data.ownerName} />
                                    </Card>
                                </Col>
                                <Col >
                                    <Card hoverable style={{borderRadius:'5px'}}>
                                        <Statistic title="类别" value={data.category} />
                                    </Card>
                                </Col>
                             </Row>
                             <Row style={{ marginBottom: '20px'}}>
                                <label className='label_title'>
                                    模型指标
                                </label>
                                <div>
                                    <Table  dataSource={dataMetric} columns={columns} scroll={{ y: 240 }} pagination={false}/>
                                </div>
                             </Row>
                        </div>
                        <div className='header_content_right'>
                            <label className='label_title'>
                                历史记录
                            </label>
                            <div className='emptyImagebox' id='emptylist'>
                                <ConfigProvider renderEmpty={this.myEmpty}>
                                    <InfiniteScroll
                                        dataLength={log.length}
                                        hasMore={false}
                                        endMessage={log.length===0?null:<Divider plain>It is all, nothing more...</Divider>}
                                        scrollableTarget='emptylist'
                                    >
                                        <List
                                                loading = {initiallogloading}
                                                dataSource={log}
                                                renderItem={(item,index)=> (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            title={item.name}
                                                            description={new Date(item.time* 1000).toLocaleString()} 
                                                        />
                                                        <div>{item.ip}</div>
                                                    </List.Item>
                                                )}
                                        ></List>
                                    </InfiniteScroll>
                                </ConfigProvider>
                            </div>
                        </div>
                    </div>
                </section>
                {type == 1 ? null :
                    <section className='contentsection'>
                        <div className='list_content'>
                            <label className='label_title'>
                                计算任务
                            </label>
                            <List
                                loading = {initialloadingModel}
                                dataSource={modellist}
                                style={{marginLeft:'20px'}}
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 2,
                                    md: 2,
                                    lg: 2,
                                    xl: 3,
                                    xxl: 3,
                                }}
                                renderItem={(item,index)=> (
                                    <List.Item key={item.name}>
                                        <Card key = {item.name}
                                            actions={[
                                                <div>
                                                    <p>{modellistParticipant[index].num}</p>
                                                    <p>参与者数</p>
                                                </div>,
                                                <div>
                                                    <p>{item.serialNum}</p>
                                                    <p>链上序号</p>
                                                </div>
                                                
                                            ]}
                                            style={{borderRadius:'10px',borderColor:'#eaeef5'}}
                                            hoverable
                                            onClick={this.showModel.bind(this, index)}
                                        >
                                            <Skeleton loading={item.loading}>
                                                <Meta
                                                    title={<span className='Modeltitle'>{item.name} {item.isfinished ? <Tag style = {{marginLeft:'10px', verticalAlign:'middle'}} color="success">Finished</Tag>  : <Tag style = {{marginLeft:'10px', verticalAlign:'middle'}} color="red">Unfinished</Tag>} </span>}
                                                    description = {<p className='Modeldescription'>{item.description}</p>}
                                                />
                                            </Skeleton>
                                        </Card>
                                    </List.Item>
                                )}
                            ></List>
                        </div>
                    </section>
                }
                
                <Modal>

                </Modal>
            </div>
        );
    }

    
}

export default detail;