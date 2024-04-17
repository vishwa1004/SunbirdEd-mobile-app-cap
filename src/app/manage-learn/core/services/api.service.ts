import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { RequestParams } from '../interfaces/request-params';
import { ToastService } from './toast/toast.service';
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { ApiUtilsService } from './api-utils.service';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { CapacitorHttp } from '@capacitor/core';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string ="https://staging.sunbirded.org";
  tokens;
  authToken;
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public apiUtils: ApiUtilsService,
    public ionicHttp: HTTP,
  ) {
    this.getToken();
  }
   setHeaders(session) {
  this.baseUrl ="https://staging.sunbirded.org";
    const headers = {
      'Authorization': this.authToken ? this.authToken  : '',
      'x-auth-token': session ? session.access_token : '',
      'X-authenticated-user-token': session ? session.access_token : '',
      'Content-Type': 'application/json',
      'X-App-Id': this.apiUtils.appName,
      'deviceId': this.deviceInfo.getDeviceID(),
    }
    if(!session?.access_token){
      delete headers['X-authenticated-user-token'];
      delete headers['x-auth-token']
    }
    return headers;
  }


  async post(requestParam: RequestParams) {
    console.log("in post",requestParam);
    try {
      const session = await this.checkTokenValidation().toPromise();
      console.log(session,"session");
      let headers = requestParam.headers ? requestParam.headers : this.setHeaders(session);
      console.log(headers,"headers");
      if (requestParam?.headers) {
        headers = { ...headers, ...requestParam?.headers }
      }
      let body = requestParam.payload ? requestParam.payload : {};
      const options = {
        url: this.baseUrl + requestParam.url,
        headers: headers,
        data: body,
      };
      console.log(options,"options");
      const data = await CapacitorHttp.post(options);
    console.log(data,"dataaa");
      return data.data;
    } catch (error) {
      console.error(error,"error");
      throw error;
    }
  }


  async get(requestParam: RequestParams) {
    console.log("in get");
    try {
      const session = await this.checkTokenValidation().toPromise();
      console.log(session,"session");
      let headers = requestParam.headers ? requestParam.headers : this.setHeaders(session);
      console.log(headers,"headers");
      if (requestParam?.headers) {
        headers = { ...headers, ...requestParam?.headers }
      }
     
      const options = {
        url: this.baseUrl + requestParam.url,
        headers: headers,
        params:{}
      };
      console.log(options,"options");
      const data = await CapacitorHttp.get(options);
      console.log(data,"dataaa");
      return data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  async delete(requestParam: RequestParams) {
    return this.checkTokenValidation().pipe(
      mergeMap(session => {
    const headers = requestParam.headers ? requestParam.headers : this.setHeaders(session);
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: '',
    };
    return CapacitorHttp.delete(options)
      .then((data: any) => {
       
      }, error => {
                    console.log(error,"error");
                    catchError(this.handleError(error))
                  });
    }))
  }


  checkTokenValidation(): Observable<any> {
    return this.authService.getSession().pipe(
      mergeMap(tokens => {
        if(tokens){
          const token = jwt_decode(tokens.access_token);
          const tokenExpiryTime = moment(token.exp * 1000);
          const currentTime = moment(Date.now());
          const duration = moment.duration(tokenExpiryTime.diff(currentTime));
          const hourDifference = duration.asHours();
          if (hourDifference < 2) {
            return this.authService.refreshSession().pipe(
              mergeMap(refreshData => {
                return this.authService.getSession()
              })
            )
          } else {
            return this.authService.getSession()
          }
        }else{
          return observableOf({})
        }
      })
    )
  }

  getToken() {
    this.preferences.getString('api_bearer_token_v2').subscribe(resp => {
      this.authToken = `Bearer ${resp}`;
    });
  }


  private handleError(result) {
    let status  = result.status <= 0 ? 0 :result.status;
    switch (status) {
      case 0:
        this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
        break
      case 401:
        this.toast.showMessage('Session expired', 'danger')
        break
      default:
        const errorMessage = result.error ? JSON.parse(result.error).message : 'FRMELEMNTS_MSG_SOMETHING_WENT_WRONG'
        this.toast.showMessage(errorMessage, 'danger')

    }
    return (error: any): Observable<any> => {
      return observableOf(result);
    };
  }
}