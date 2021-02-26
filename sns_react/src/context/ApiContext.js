import React, {createContext, useState, useEffect} from "react";
import {withCookies} from "react-cookie";
import axios from "axios";

export const ApiContext = createContext();

const ApiContextProvider = (props) => {
    // クッキーからToken情報を取得
    const token = props.cookies.get("current-token");
    // 自分のプロフィール
    const [profile, setProfile] = useState([]);
    // 全てのプロフィール
    const [profiles, setProfiles] = useState([]);
    // プロフィール編集
    const [editedProfile, setEditedProfile] = useState({id: "", nickName: ""});
    // 自分宛の友達申請リスト
    const [askList, setAskList] = useState([]);
    // 自分が送った友達申請も含めたリスト
    const [askListFull, setAskListFull] = useState([]);
    // ダイレクトメッセージの受信箱
    const [inbox, setInbox] = useState([]);
    // 自分のプロフィールの画像
    const [cover, setCover] = useState([]);

    // アプリケーションを起動時に、自分のプロフィールやプロフィールのリストを取得
    useEffect(() => {
        const getMyProfile = async () => {
            try {
                // ログインユーザーのプロフィールを取得
                const resmy = await axios.get(
                    "http://localhost:8000/api/user/myprofile/",
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );
                // 友達申請リストを取得
                const res = await axios.get(
                    "http://localhost:8000/api/user/approval/",
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );
                // プロフィールをpfofileに格納
                resmy.data[0] && setProfile(resmy.data[0]);
                // プロフィールをeditedProfileに格納
                resmy.data[0] &&
                setEditedProfile({
                    id: resmy.data[0].id,
                    nickName: resmy.data[0].nickName,
                });
                // 自分宛の友達申請リストをaskListに格納
                resmy.data[0] &&
                setAskList(
                    res.data.filter((ask) => {
                        return resmy.data[0].userPro === ask.askTo;
                    })
                );
                // 自分が送った友達申請も含めたリストをaskListFullに格納
                setAskListFull(res.data);
            } catch {
                console.log("error");
            }
        };

        // 全てのプロフィールを取得
        const getProfile = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/user/profile/", {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
                // 全てのプロフィールをprofilesに格納
                setProfiles(res.data);
            } catch {
                console.log("error");
            }
        };

        // ダイレクトメッセージの受信箱を取得
        const getInbox = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/dm/inbox/", {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
                // ダイレクトメッセージの受信箱をinboxに格納
                setInbox(res.data);
            } catch {
                console.log("error");
            }
        };
        getMyProfile();
        getProfile();
        getInbox();
    }, [token, profile.id]);

    // プロフィールの作成
    const createProfile = async () => {
        const createData = new FormData();
        createData.append("nickName", editedProfile.nickName);
        cover.name && createData.append("img", cover, cover.name);
        try {
            const res = await axios.post(
                "http://localhost:8000/api/user/profile/",
                createData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setProfile(res.data);
            setEditedProfile({id: res.data.id, nickName: res.data.nickName});
        } catch {
            console.log("error");
        }
    };

    // プロフィールの削除
    const deleteProfile = async () => {
        try {
            await axios.delete(
                `http://localhost:8000/api/user/profile/${profile.id}/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setProfiles(profiles.filter((dev) => dev.id !== profile.id));
            setProfile([]);
            setEditedProfile({id: "", nickName: ""});
            setCover([]);
            setAskList([]);
        } catch {
            console.log("error");
        }
    };

    // プロフィールの編集
    const editProfile = async () => {
        const editData = new FormData();
        editData.append("nickName", editedProfile.nickName);
        cover.name && editData.append("img", cover, cover.name);
        try {
            const res = await axios.put(
                `http://localhost:8000/api/user/profile/${profile.id}/`,
                editData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setProfile(res.data);
        } catch {
            console.log("error");
        }
    };

    // 友達申請
    const newRequestFriend = async (askData) => {
        try {
            const res = await axios.post(
                `http://localhost:8000/api/user/approval/`,
                askData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setAskListFull([...askListFull, res.data]);
        } catch {
            console.log("error");
        }
    };

    // ダイレクトメッセージ送信
    const sendDMCont = async (uploadDM) => {
        try {
            await axios.post(`http://localhost:8000/api/dm/message/`, uploadDM, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            });
        } catch {
            console.log("error");
        }
    };

    // 友達申請承認
    const changeApprovalRequest = async (uploadDataAsk, ask) => {
        try {
            const res = await axios.put(
                `http://localhost:8000/api/user/approval/${ask.id}/`,
                // approvalをtrueに変換したフォームデータ
                uploadDataAsk,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );
            setAskList(askList.map((item) => (item.id === ask.id ? res.data : item)));

            // askFromとaskToを入れ替え、approvalをtrueにして友達申請
            const newDataAsk = new FormData();
            newDataAsk.append("askTo", ask.askFrom);
            newDataAsk.append("approved", true);

            // 既にaskFromとaskToを入れ替えたオブジェクトが存在する場合の友達申請
            const newDataAskPut = new FormData();
            newDataAskPut.append("askTo", ask.askFrom);
            newDataAskPut.append("askFrom", ask.askTo);
            newDataAskPut.append("approved", true);

            // 既にaskFromとaskToを入れ替えたオブジェクトが存在するか確認
            const resp = askListFull.filter((item) => {
                return item.askFrom === profile.userPro && item.askTo === ask.askFrom;
            });

            !resp[0]
                ? await axios.post(
                `http://localhost:8000/api/user/approval/`,
                newDataAsk,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
                )
                : await axios.put(
                `http://localhost:8000/api/user/approval/${resp[0].id}/`,
                newDataAskPut,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
                );
        } catch {
            console.log("error");
        }
    };

    return (
        <ApiContext.Provider
            value={{
                profile,
                profiles,
                cover,
                setCover,
                askList,
                askListFull,
                inbox,
                newRequestFriend,
                createProfile,
                editProfile,
                deleteProfile,
                changeApprovalRequest,
                sendDMCont,
                editedProfile,
                setEditedProfile,
            }}
        >
            {props.children}
        </ApiContext.Provider>
    );
};

export default withCookies(ApiContextProvider);
