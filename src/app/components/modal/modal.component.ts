import { Component } from '@angular/core';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: false
})
export class ModalTemplateComponent {
  // TODO: Implement modal data injection without Polarity
  // data: any = inject(MODAL_DATA);
  // modal: any = inject(MODAL_REF);
  thread: any = {};
  title: string = '';
  type: string = '';
  newThreadName: string = '';

  constructor() { }

  async ngOnInit() {
    // TODO: Initialize modal data
    // console.log('Modal data:', this.data.thread);
    // this.thread = this.data.thread || {};
    // this.title = this.data.heading
    // this.type = this.data.type;
    // this.newThreadName = this.data.thread?.name
  }

  closeModal() {
    // TODO: Implement modal close
    // this.modal.close();
  }

  async updateThreadName() {
    // TODO: Implement thread rename
    // this.modal.close({type: 'rename', threadId: this.thread._id, newName: this.newThreadName});
  }

  async deleteThread() {
    // TODO: Implement thread deletion
    // this.modal.close({type: 'delete', threadId: this.thread._id});
  }
}
