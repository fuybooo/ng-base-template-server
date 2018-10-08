import execTrans from './db-helper';
import config from './config';
import * as fs from 'fs';
import * as path from 'path';

daoGenerate();
/**
 * 根据表自动生成实体类和拼接sql的类
 */
function daoGenerate() {
    execTrans(`
    select * from information_schema.columns where table_name in (
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA = '${config.TABLE_SCHEMA}'
    ) and TABLE_SCHEMA = '${config.TABLE_SCHEMA}'
`, (data) => {
        const files = getFiles(data[0]);
        generator(data[0], files);
    });
}
function getName(tableName) {
    return tableName.replace(config.TABLE_SUFFIX, '');
}
function getFiles(columns) {
    let firstTableName = columns[0].TABLE_NAME;
    let dirName = getName(firstTableName);
    let files = [{
        tableName: firstTableName,
        mainName: getMainName(dirName),
        dirName,
        fileName: getFileName(dirName),
    }];
    columns.forEach(col => {
        if (!files.some(f => f.tableName === col.TABLE_NAME)) {
            let tableName = col.TABLE_NAME;
            let dirName = getName(tableName);
            files = [...files, {
                tableName: tableName,
                mainName: getMainName(dirName),
                dirName,
                fileName: getFileName(dirName)
            }];
        }
    });
    return files;
}
function generator(columns, files) {
    const daoDir = config.genDaoPath + '/dao';
    files.forEach(file => {
        // 生成class
        writeFile(daoDir, file, getMainLines(columns, file));
    });

}
function getMainLines(columns, file) {
    let lines = `/**
 * ${file.mainName}
 */
export default class ${file.mainName} {
`;
    columns.forEach(col => {
        if (col.TABLE_NAME === file.tableName) {
            lines += `  public ${col.COLUMN_NAME}: ${getFieldType(col.DATA_TYPE)}; // ${col.COLUMN_COMMENT || col.COLUMN_NAME}\n`;
        }
    });
    const params = columns.filter((col) => col.TABLE_NAME === file.tableName).map(
        (col, i) => `${i ? '              ' : ''}${col.COLUMN_NAME}?: ${getFieldType(col.DATA_TYPE)}`
    ).join(',\n');
    const stat = columns.filter((col) => col.TABLE_NAME === file.tableName).map(
        (col, i) => `${i ? '    ' : ''}this.${col.COLUMN_NAME} = ${col.COLUMN_NAME};`
    ).join('\n');
    lines += `
  // 构造函数
  constructor(${params}) {
    ${stat}
  }
`;
    lines += `}
`;
    return lines;
}

function writeFile(daoDir, file, lines, isExample = false) {
    // 先创建多层文件夹
    mkdir(daoDir + `/${file.dirName}`);
    const filePath = daoDir + `/${file.dirName}/${isExample ? file.fileName + '-example' : file.fileName}.ts`;
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    fs.writeFile(filePath, lines, (err) => {
        if (err) {
            console.log('writeFile失败了：', err);
        }
    });
}

function getFieldType(dataType) {
    let ret = 'string';
    switch (dataType) {
        case 'int':
            ret = 'number';
            break;
    }
    return ret;
}

function getMainName(tableName: string) {
    return tableName.split('_').map(item => item.slice(0, 1).toUpperCase() + item.slice(1)).join('');
}

function getFileName(tableName: string) {
    return tableName.split('_').join('-');
}

/**
 * 创建文件夹： 传入 /dao 则创建 node-dao-gen/dao
 * @param _path
 * @param children
 */
function mkdir(_path, children = []) {
    const abPath = _path.startsWith('/') ? path.dirname(__dirname) + _path : _path;
    if (!fs.existsSync(abPath)) {
        const parentPath = path.resolve(abPath, '..');
        if (!fs.existsSync(parentPath)) {
            mkdir(parentPath, [abPath, ...children]);
        } else {
            fs.mkdirSync(abPath);
            children.forEach(item => {
                fs.mkdirSync(item);
            })
        }
    }
}