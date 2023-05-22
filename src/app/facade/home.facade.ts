import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { Observable, combineLatest, map } from 'rxjs';
import { HomeState } from '../state/home.state';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import { PredictEvent } from '../models/predict-event.model';

const initialState: HomeState = {
  isLeft: false,
  isStarted: false,
  isLoading: false,
}

@Injectable({
  providedIn: 'root'
})
export class HomeFacadeService extends FacadeService<HomeState>{

  model!: tmImage.CustomMobileNet
  isLeft$: Observable<boolean> = this.select((state => state.isLeft))
  isStarted$: Observable<boolean> = this.select((state => state.isStarted))
  isLoading$: Observable<boolean> = this.select((state => state.isLoading))

  viewModel$: Observable<HomeState> = combineLatest([
    this.isLeft$,
    this.isStarted$,
    this.isLoading$,]).pipe(
      map(([isLeft, isStarted, isLoading]) => {
        return {
          isLeft,
          isStarted,
          isLoading,
        }
      }))

  constructor() {
    super(initialState);
  }


  async start() {
    this.setState({ isStarted: true })
    this.setState({ isLoading: true })
    const URL = '../assets/model/'
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    this.model = await tmImage.load(modelURL, metadataURL);
  }

  classify(image: HTMLCanvasElement) {
    this.setState({ isLoading: false })
    this.model.predict(image).then((results) =>{
      let prediction = Object.assign({}, ...results.map((x) => ({[x.className]: x.probability})));
      this.setState({isLeft: prediction['right'] < prediction['left']});
      console.log(prediction);
    })

  }

  loaded() {
    this.setState({ isLoading: false })
  }


  stop() {
    this.setState({ isStarted: false })
  }

}
