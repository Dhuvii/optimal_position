export default class Rectangle {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Optional: You can add methods to calculate area or perimeter if needed
  public getArea(): number {
    return this.width * this.height;
  }

  public getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}
