
var load=require('../main/datbase.js');
const loadAllItems=load.loadAllItems;
const loadPromotions=load.loadPromotions;
function main() {
   console.log("Debug Info");
    return 'Hello World!';
};

module.exports=function printInventory(inputItems){
  let normal_items=Normalize_items(inputItems);
  let promotion=Calcultate_subPrice(normal_items);
  let str_result=Print_result(normal_items,promotion);
  console.log(str_result);
}
//标准化输入格式
function Normalize_items(inputItems){
  let normal_items=[];
  let items_count=Count_items(inputItems);//name,count
  let allItems=loadAllItems();
  for(let key in items_count){
    let item=item_of_allItems(key,allItems);
    let normal_item={};
    normal_item.id=key;
    normal_item.number=items_count[key];
    normal_item.name=item.name;
    normal_item.unit=item.unit;
    normal_item.price=item.price;
    normal_item.totalPrice=normal_item.price*normal_item.number;
    normal_items.push(normal_item);
  }
  return normal_items;
}
//统计优惠及优惠价格
function Calcultate_subPrice(normal_items){
  let promotion={};
  promotion.subprice=0;
  let promotion_items=[];
  let promotion_ids=loadPromotions()[0].barcodes;
  for(let item of normal_items){
    if(include_item_in_promotions(item.id,promotion_ids)){
      let promotion_item={};
      promotion_item.name=item.name;
      promotion_item.number=parseInt(item.number/3);
      promotion_item.unit=item.unit;
      promotion_items.push(promotion_item);
      promotion.items=promotion_items;
      promotion.subprice+=  promotion_item.number*item.price;
    }
  }
  return promotion;
}
//修正每个商品价格 及打印结果
function Print_result(normal_items,promotion){
  let total_price=0;
  let str_result= '***<没钱赚商店>购物清单***\n';
  for(let item of normal_items){
    //修正每个商品总价
    for(let promotion_item of promotion.items){
      if(item.name==promotion_item.name){
        item.totalPrice-=item.price*promotion_item.number;
      }
    }
    total_price+=item.totalPrice;
    str_result+=`名称：${item.name}，数量：${item.number}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.totalPrice.toFixed(2)}(元)\n`
  }
  str_result+='----------------------\n挥泪赠送商品：\n' ;
  for(let promotion_item of promotion.items){
    str_result+=`名称：${promotion_item.name}，数量：${promotion_item.number}${promotion_item.unit}\n`;
  }
  str_result+='----------------------\n';
  str_result+=`总计：${total_price.toFixed(2)}(元)\n节省：${promotion.subprice.toFixed(2)}(元)\n**********************`
  return str_result;
}

function Count_items(inputItems){
  let items_count={};
  for(let item of inputItems){
    let item_count=item.split('-');//name,number
    if(!item_count[1]) item_count.push('1');
    if(items_count[item_count[0]]){
      items_count[item_count[0]] +=parseInt(item_count[1]);
    }else{
      items_count[item_count[0]]=parseInt(item_count[1]);
    }
  }
  return items_count;
}
function item_of_allItems(item_id,allItems){
  for(let item of allItems){
    if(item_id==item.barcode) return item;
  }
  return false;
}
function include_item_in_promotions(id,promotion_ids){
  for(let promotion_id of promotion_ids){
    if(id==promotion_id){
      return true;
    }
  }
  return false;
}
