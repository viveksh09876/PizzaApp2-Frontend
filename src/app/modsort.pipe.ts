import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'modsort'
})
export class ModsortPipe implements PipeTransform {

  transform(array: any[], field: string): any[] {
    array.sort((a: any, b: any) => {
      let returnVal = 0;

      if(a.Option.no_modifier == 1 || b.Option.no_modifier == 1) {
        return 0;
      }else {
        if((a.Option.plu_code == '999991' || 
              a.Option.plu_code == '999992' ||
                a.Option.plu_code == '999993') || (b.Option.plu_code == '999991' || 
                b.Option.plu_code == '999992' ||
                  b.Option.plu_code == '999993')) {
                                
              return 0;

        } else {
        
          if(a.Option.is_checked === b.Option.is_checked) {
            returnVal = 0;
          }else if(a.Option.is_checked) {
            returnVal = -1;
          }else {
            returnVal = 1;
          }
        
        }
      }

      

     return returnVal;
    
    });
    return array;
  }

}
