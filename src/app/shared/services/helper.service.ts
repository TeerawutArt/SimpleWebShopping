import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor() {}

  remainTime(date: Date) {
    //คำนวนเวลาคงเหลือ
    const curDate = new Date();
    curDate.setFullYear(curDate.getFullYear() + 543); //แปลงเป็น พ.ศ ด้วย
    // prettier-ignore
    const differTimeMs = date.getTime() - curDate.getTime(); //millisecond
    //แปลง มิลลิวินาที ให้อยู่ในรูปของเวลา day:hour:minute
    const days = Math.floor(differTimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (differTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((differTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      day: days,
      hour: hours,
      minute: minutes,
    };
  }
}
