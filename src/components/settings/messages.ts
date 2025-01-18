// 定义设置对话框的消息类型
export interface SettingsMessages {
  dialog: {
    title: string;
    searchTitle: string;
    searchDescription: string;
    preferredTitle: string;
    blacklistTitle: string;
  };
  blacklist: {
    input: {
      placeholder: string;
      add: string;
    };
    list: {
      remove: string;
      empty: string;
    };
  };
  preferred: {
    input: {
      placeholder: string;
      add: string;
    };
    list: {
      remove: string;
      empty: string;
    };
    maxLimit: string;
    message: string;
  };
}
