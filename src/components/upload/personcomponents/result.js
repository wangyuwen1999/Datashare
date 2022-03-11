import { Divider, message} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';
import './result.css'


let url = window.config.url;
let fileurl = window.config.fileurl;

const API = {
    'getDataList':'/datalist?type=', 
    'delete':'/delete',
    'getCategory':'/Category/validList',
}

const type = 3;

class result extends React.Component{
    constructor(params){
        super(params);
        this.state = {
            filelist: [],
            initailloading: true,

            Category: [],
            CategoryNumList: []
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

    getDatalist  = () => {
        let api = fileurl + API['getDataList'] + type;
        fetch(api, {
            method: "GET",
            mode: "cors",
        }).then(response => response.json()).then((value) => {
            console.log(value);
            if (value['state'] == false){
                message.warning('文件分布式系统未开启');
                return;
            }
            this.setState({
                list: value['data'].reverse(),
                initailloading: false,
            });
        });
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
        if (typeof(num) != Number){
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
        return Category[rindex];
    }

    componentDidMount(){
        this.getDatalist();
        this.getCategory();
    }

    render(){
        const {filelist, Category, CategoryNumList, initailloading} = this.state;
        return(
            <div className='subpage'>
                <div className='pageHeader'>
                    我的结果上传记录
                    <Divider className='myDividerstyle'></Divider>
                </div>
                <div>
                     {/* <List
                            loading = {initiallogloading}
                            dataSource={filelist}
                            renderItem={(item,index)=> (
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.name}
                                        description={new Date(item.time* 1000).toLocaleString()} 
                                    />
                                    <div>{item.ip}</div>
                                </List.Item>
                            )}
                    ></List> */}
                </div>
            </div>
        )
    }
}

export default result;