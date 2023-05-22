import { Component, ElementRef, ViewChild } from '@angular/core';
import { HomeFacadeService } from './facade/home.facade';
import { HomeState } from './state/home.state';
import { Observable, Subject } from 'rxjs';
import * as tmImage from '@teachablemachine/image';
import { Webcam } from '@teachablemachine/image';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nod-classify';
  viewModel$ : Observable<HomeState> = this.homeFacadeService.viewModel$;
  private trigger: Subject<void> = new Subject<void>();

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  gameLoop: any
  @ViewChild('video', { static: false }) video?: ElementRef;

  webcam!: Webcam;

  constructor(private homeFacadeService: HomeFacadeService){}

  async loop() {
   this.webcam.update();
    this.homeFacadeService.classify(this.webcam.canvas)
   requestAnimationFrame(() =>
    this.loop()
   );
  }

  async onStart(){
    this.homeFacadeService.start();
    await this.startCamera();
  }

  async  startCamera() {
    this.webcam = new tmImage.Webcam(400, 400, true);
    await this.webcam.setup();
    await this.webcam.play();
    requestAnimationFrame(() => this.loop());
    if (this.video) {
      this.video!.nativeElement.appendChild(this.webcam.canvas);
    }
  }

  async onStop(){
    this.homeFacadeService.stop();
    await this.webcam.stop()
  }
}
