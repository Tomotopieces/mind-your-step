import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import {BLOCK_SIZE, PlayerController} from "db://assets/Script/PlayerController";
const { ccclass, property } = _decorator;

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

enum BlockTypes {
    BT_NONE,
    BT_STONE,
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Node })
    public startMenu: Node | null = null;

    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;

    @property({ type: Label })
    public stepLabel: Label | null = null;

    @property({ type: Prefab })
    public boxPrefab: Prefab | null = null;

    @property({ type: CCInteger })
    public roadLength: number = 50;

    private _road: BlockTypes[] = [];

    start() {
        this.setState(GameState.GS_INIT);
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
            this.stepLabel.enabled = false;
        }

        if (this.playerCtrl) {
            this.playerCtrl.setInputActivate(false);
            this.playerCtrl.reset();
        }

        this.node.removeAllChildren();
        this._road = [];
        this._road.push(BlockTypes.BT_STONE);
    }

    play() {
        this.generateRoad();

        if (this.startMenu) {
            this.startMenu.active = false;
        }

        if (this.stepLabel) {
            this.stepLabel.enabled = true;
            this.stepLabel.string = '0';
        }

        setTimeout(() => {
            if (this.playerCtrl) {
                this.playerCtrl.setInputActivate(true);
            }
        }, 0.1);
    }



    setState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.play();
                break;
            case GameState.GS_END:
                break;
        }
    }

    generateRoad() {
        for (let i = 1; i < this.roadLength - 1; i++) {
            if (this._road[i - 1] === BlockTypes.BT_NONE) {
                this._road.push(BlockTypes.BT_STONE);
            } else  {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
        this._road.push(BlockTypes.BT_STONE);

        for (let i = 0; i < this._road.length; i++) {
            const block: Node = this.spawnBlockByType(this._road[i]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(i * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockTypes): Node {
        if (!this.boxPrefab) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockTypes.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }

        return block;
    }

    onStartButtonClicked() {
        this.setState(GameState.GS_PLAYING);
    }

    checkResult(modeIndex: number) {
        if (modeIndex < this.roadLength) {
            if (this._road[modeIndex] === BlockTypes.BT_NONE) {
                this.setState(GameState.GS_INIT);
            }
        } else {
            this.setState(GameState.GS_INIT);
        }
    }

    onPlayerJumpEnd(modeIndex: number) {
        if (this.stepLabel) {
            this.stepLabel.string = '' + Math.min(modeIndex, this.roadLength);
        }
        this.checkResult(modeIndex);
    }
}


